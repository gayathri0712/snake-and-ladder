document.addEventListener("DOMContentLoaded", () => {
    const setupScreen = document.getElementById("setupScreen");
    const gameScreen = document.getElementById("gameScreen");

    const startButton = document.getElementById("startButton");
    const randomButton = document.getElementById("randomButton");

    const playerCountContainer = document.getElementById("playerCount");
    const playerConfig = document.getElementById("playerConfig");

    const modeCards = document.querySelectorAll(".mode-card");

    const cells = document.getElementById("cells");
    const piecesLayer = document.getElementById("piecesLayer");
    const visualLayer = document.getElementById("visualLayer");

    const rollButton = document.getElementById("rollButton");
    const diceCube = document.getElementById("diceCube");

    const playersList = document.getElementById("playersList");
    const gameLog = document.getElementById("gameLog");
    const moveCountElement = document.getElementById("moveCount");

    const turnName = document.getElementById("turnName");
    const turnAvatar = document.getElementById("turnAvatar");
    const turnStatus = document.getElementById("turnStatus");
    const turnPosition = document.getElementById("turnPosition");
    const turnHeadline = document.getElementById("turnHeadline");

    const exitButton = document.getElementById("exitButton");

    const settingsButton = document.getElementById("settingsButton");
    const closeSettingsButton = document.getElementById("closeSettingsButton");
    const settingsModal = document.getElementById("settingsModal");

    const soundButton = document.getElementById("soundButton");
    const themeButton = document.getElementById("themeButton");

    const soundSetting = document.getElementById("soundSetting");
    const motionSetting = document.getElementById("motionSetting");

    const exitModal = document.getElementById("exitModal");
    const cancelExitButton = document.getElementById("cancelExitButton");
    const confirmExitButton = document.getElementById("confirmExitButton");

    const winnerModal = document.getElementById("winnerModal");
    const winnerAvatar = document.getElementById("winnerAvatar");
    const winnerTitle = document.getElementById("winnerTitle");

    const statMoves = document.getElementById("statMoves");
    const statLadders = document.getElementById("statLadders");
    const statSnakes = document.getElementById("statSnakes");

    const playAgainButton = document.getElementById("playAgainButton");
    const winnerSetupButton = document.getElementById("winnerSetupButton");

    const confettiContainer = document.getElementById("confettiContainer");

    const toastRegion = document.getElementById("toastRegion");

    const previewBoard = document.getElementById("previewBoard");

    /* =====================================================
       GAME STATE
       ===================================================== */

    let playerCount = 4;
    let selectedMode = "local";

    let players = [];
    let currentPlayer = 0;

    let totalMoves = 0;
    let gameRunning = false;
    let rolling = false;

    let soundEnabled = true;
    let motionEnabled = true;

    let audioContext = null;

    const colors = [
        "#7c3aed",
        "#06b6d4",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#ec4899"
    ];

    const colorNames = [
        "Purple",
        "Cyan",
        "Green",
        "Orange",
        "Red",
        "Pink"
    ];

    /*
       Standard Snakes & Ladders positions.

       Ladders:
       4 -> 14
       9 -> 31
       20 -> 38
       28 -> 84
       40 -> 59
       51 -> 67
       63 -> 81
       71 -> 91

       Snakes:
       17 -> 7
       54 -> 34
       62 -> 19
       64 -> 60
       87 -> 24
       93 -> 73
       95 -> 75
       99 -> 78
    */

    const ladders = {
        4: 14,
        9: 31,
        20: 38,
        28: 84,
        40: 59,
        51: 67,
        63: 81,
        71: 91
    };

    const snakes = {
        17: 7,
        54: 34,
        62: 19,
        64: 60,
        87: 24,
        93: 73,
        95: 75,
        99: 78
    };

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    initialize();

    function initialize() {
        createPlayerConfig();
        createPreviewBoard();
        createBoard();

        setupEventListeners();

        loadSettings();

        updateSelectedMode();

        showToast("Ready to roll!", "success");
    }

    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    function setupEventListeners() {

        /* Mode buttons */
        modeCards.forEach(card => {
            card.addEventListener("click", () => {

                selectedMode = card.dataset.mode;

                updateSelectedMode();

                createPlayerConfig();

                playClickSound();
            });
        });

        /* Player count */
        if (playerCountContainer) {

            playerCountContainer.addEventListener("click", event => {

                const button = event.target.closest("button");

                if (!button) return;

                const count = Number(button.dataset.count);

                if (!count) return;

                playerCount = count;

                document
                    .querySelectorAll("#playerCount button")
                    .forEach(btn => {
                        btn.classList.remove("is-selected");
                    });

                button.classList.add("is-selected");

                createPlayerConfig();

                playClickSound();
            });
        }

        /* Start game */
        startButton.addEventListener("click", startGame);

        /* Random setup */
        randomButton.addEventListener("click", randomSetup);

        /* Roll dice */
        rollButton.addEventListener("click", rollDice);

        /* Exit */
        exitButton.addEventListener("click", () => {

            if (!gameRunning) return;

            exitModal.hidden = false;

            playClickSound();
        });

        /* Cancel exit */
        cancelExitButton.addEventListener("click", () => {

            exitModal.hidden = true;

            playClickSound();
        });

        /* Confirm exit */
        confirmExitButton.addEventListener("click", () => {

            exitModal.hidden = true;

            gameRunning = false;

            showSetup();

            playClickSound();
        });

        /* Settings */
        settingsButton.addEventListener("click", () => {

            settingsModal.hidden = false;

            playClickSound();
        });

        closeSettingsButton.addEventListener("click", () => {

            settingsModal.hidden = true;

            playClickSound();
        });

        /* Sound */
        soundButton.addEventListener("click", toggleSound);

        soundSetting.addEventListener("change", () => {

            soundEnabled = soundSetting.checked;

            updateSoundButton();

            if (soundEnabled) {
                playClickSound();
            }

            saveSettings();
        });

        /* Motion */
        motionSetting.addEventListener("change", () => {

            motionEnabled = motionSetting.checked;

            document.body.classList.toggle(
                "reduce-motion",
                !motionEnabled
            );

            saveSettings();
        });

        /* Theme */
        themeButton.addEventListener("click", toggleTheme);

        /* Winner */
        playAgainButton.addEventListener("click", () => {

            winnerModal.hidden = true;

            startGame();

        });

        winnerSetupButton.addEventListener("click", () => {

            winnerModal.hidden = true;

            showSetup();

        });

        /* Close modal when clicking outside */
        settingsModal.addEventListener("click", event => {

            if (event.target === settingsModal) {
                settingsModal.hidden = true;
            }

        });

        exitModal.addEventListener("click", event => {

            if (event.target === exitModal) {
                exitModal.hidden = true;
            }

        });

        winnerModal.addEventListener("click", event => {

            if (event.target === winnerModal) {
                winnerModal.hidden = true;
            }

        });

        /* Spacebar */
        document.addEventListener("keydown", event => {

            if (event.code !== "Space") return;

            if (!gameRunning) return;

            if (winnerModal.hidden === false) return;

            event.preventDefault();

            rollDice();

        });

    }

    /* =====================================================
       PLAYER CONFIGURATION
       ===================================================== */

    function createPlayerConfig() {

        if (!playerConfig) return;

        playerConfig.innerHTML = "";

        for (let i = 0; i < playerCount; i++) {

            const playerCard = document.createElement("div");

            playerCard.className = "player-config-item";

            playerCard.innerHTML = `
                <div class="player-config-avatar"
                     style="background:${colors[i]}">
                    ${i + 1}
                </div>

                <div class="player-config-info">
                    <strong>Player ${i + 1}</strong>
                    <small>${colorNames[i]}</small>
                </div>
            `;

            playerConfig.appendChild(playerCard);
        }

    }

    /* =====================================================
       MODE SELECTION
       ===================================================== */

    function updateSelectedMode() {

        modeCards.forEach(card => {

            card.classList.toggle(
                "is-selected",
                card.dataset.mode === selectedMode
            );

        });

        if (selectedMode === "ai") {

            showToast(
                "VS AI selected. Player 1 will play against the computer.",
                "success"
            );

        } else if (selectedMode === "tournament") {

            showToast(
                "Tournament mode selected.",
                "success"
            );

        }

    }

    /* =====================================================
       RANDOM SETUP
       ===================================================== */

    function randomSetup() {

        const modes = [
            "local",
            "ai",
            "tournament"
        ];

        selectedMode =
            modes[Math.floor(Math.random() * modes.length)];

        playerCount =
            Math.floor(Math.random() * 5) + 2;

        /* Update player buttons */

        document
            .querySelectorAll("#playerCount button")
            .forEach(button => {

                button.classList.toggle(
                    "is-selected",
                    Number(button.dataset.count) === playerCount
                );

            });

        updateSelectedMode();

        createPlayerConfig();

        playClickSound();

        showToast(
            `Random setup: ${playerCount} players`,
            "success"
        );
    }

    /* =====================================================
       START GAME
       ===================================================== */

    function startGame() {

        gameRunning = true;
        rolling = false;

        totalMoves = 0;
        currentPlayer = 0;

        players = [];

        for (let i = 0; i < playerCount; i++) {

            let isAI = false;

            if (selectedMode === "ai") {
                isAI = i !== 0;
            }

            players.push({

                id: i,

                name:
                    isAI
                        ? `AI Player ${i}`
                        : `Player ${i + 1}`,

                position: 1,

                color: colors[i],

                colorName: colorNames[i],

                moves: 0,

                ladders: 0,

                snakes: 0,

                isAI: isAI,

                finished: false

            });

        }

        /* Tournament mode is still multiplayer */
        if (selectedMode === "tournament") {

            players.forEach(player => {
                player.isAI = false;
            });

        }

        setupScreen.hidden = true;
        gameScreen.hidden = false;

        winnerModal.hidden = true;
        exitModal.hidden = true;

        createBoard();

        renderPlayers();

        renderPieces();

        updateTurnUI();

        gameLog.innerHTML = "";

        addLog(
            `<strong>Game started!</strong> ${getModeName()}`
        );

        addLog(
            `${players[0].name} goes first.`
        );

        moveCountElement.textContent = "0 moves";

        rollButton.disabled = false;

        playStartSound();

        showToast(
            `${players[0].name}, your turn!`,
            "success"
        );

        /* AI first turn should not happen because player 1 is human */
    }

    function getModeName() {

        if (selectedMode === "local") {
            return "Local Multiplayer";
        }

        if (selectedMode === "ai") {
            return "VS AI";
        }

        return "Tournament";
    }

    /* =====================================================
       BOARD CREATION
       ===================================================== */

    function createBoard() {

        if (!cells) return;

        cells.innerHTML = "";

        /*
           100 squares.
           The visual board is generated from 1 to 100.
        */

        for (let position = 1; position <= 100; position++) {

            const cell = document.createElement("div");

            cell.className = "cell";

            cell.dataset.position = position;

            const number = document.createElement("span");

            number.className = "cell-number";

            number.textContent = position;

            cell.appendChild(number);

            /* Ladder */
            if (ladders[position]) {

                cell.classList.add("has-ladder");

                const label =
                    document.createElement("span");

                label.className = "cell-marker";

                label.textContent = "↗";

                label.title =
                    `Ladder to ${ladders[position]}`;

                cell.appendChild(label);
            }

            /* Snake */
            if (snakes[position]) {

                cell.classList.add("has-snake");

                const label =
                    document.createElement("span");

                label.className = "cell-marker";

                label.textContent = "🐍";

                label.title =
                    `Snake to ${snakes[position]}`;

                cell.appendChild(label);
            }

            cells.appendChild(cell);
        }

        drawBoardVisuals();

    }

    /* =====================================================
       PREVIEW BOARD
       ===================================================== */

    function createPreviewBoard() {

        if (!previewBoard) return;

        previewBoard.innerHTML = "";

        for (let i = 1; i <= 100; i++) {

            const cell =
                document.createElement("div");

            cell.className = "preview-cell";

            cell.textContent = i;

            if (ladders[i]) {
                cell.classList.add("preview-ladder");
            }

            if (snakes[i]) {
                cell.classList.add("preview-snake");
            }

            previewBoard.appendChild(cell);
        }

    }

    /* =====================================================
       BOARD SVG VISUALS
       ===================================================== */

    function drawBoardVisuals() {

        if (!visualLayer) return;

        visualLayer.innerHTML = "";

        /*
           Draw simple ladder and snake lines.
           CSS handles the board appearance.
        */

        Object.entries(ladders).forEach(
            ([from, to]) => {

                const start =
                    getBoardCoordinate(Number(from));

                const end =
                    getBoardCoordinate(Number(to));

                drawLadder(
                    start.x,
                    start.y,
                    end.x,
                    end.y
                );

            }
        );

        Object.entries(snakes).forEach(
            ([from, to]) => {

                const start =
                    getBoardCoordinate(Number(from));

                const end =
                    getBoardCoordinate(Number(to));

                drawSnake(
                    start.x,
                    start.y,
                    end.x,
                    end.y
                );

            }
        );

    }

    function getBoardCoordinate(position) {

        /*
           Convert board position to percentage.

           Row 1 starts at bottom.
           Direction alternates every row.
        */

        const zero = position - 1;

        const row = Math.floor(zero / 10);

        let column = zero % 10;

        if (row % 2 === 1) {
            column = 9 - column;
        }

        const x =
            column * 10 + 5;

        const y =
            100 - (row * 10 + 5);

        return {
            x,
            y
        };

    }

    function drawLadder(x1, y1, x2, y2) {

        if (!visualLayer) return;

        const ns =
            "http://www.w3.org/2000/svg";

        const group =
            document.createElementNS(ns, "g");

        group.setAttribute(
            "class",
            "board-ladder"
        );

        const dx = x2 - x1;
        const dy = y2 - y1;

        const length =
            Math.sqrt(dx * dx + dy * dy);

        const offsetX =
            (-dy / length) * 1.2;

        const offsetY =
            (dx / length) * 1.2;

        const rail1 =
            document.createElementNS(
                ns,
                "line"
            );

        rail1.setAttribute(
            "x1",
            x1 + offsetX
        );

        rail1.setAttribute(
            "y1",
            y1 + offsetY
        );

        rail1.setAttribute(
            "x2",
            x2 + offsetX
        );

        rail1.setAttribute(
            "y2",
            y2 + offsetY
        );

        const rail2 =
            document.createElementNS(
                ns,
                "line"
            );

        rail2.setAttribute(
            "x1",
            x1 - offsetX
        );

        rail2.setAttribute(
            "y1",
            y1 - offsetY
        );

        rail2.setAttribute(
            "x2",
            x2 - offsetX
        );

        rail2.setAttribute(
            "y2",
            y2 - offsetY
        );

        group.appendChild(rail1);
        group.appendChild(rail2);

        const steps = Math.max(
            3,
            Math.floor(length / 10)
        );

        for (let i = 1; i < steps; i++) {

            const t = i / steps;

            const sx =
                x1 + (x2 - x1) * t;

            const sy =
                y1 + (y2 - y1) * t;

            const rung =
                document.createElementNS(
                    ns,
                    "line"
                );

            rung.setAttribute(
                "x1",
                sx - offsetX * 1.5
            );

            rung.setAttribute(
                "y1",
                sy - offsetY * 1.5
            );

            rung.setAttribute(
                "x2",
                sx + offsetX * 1.5
            );

            rung.setAttribute(
                "y2",
                sy + offsetY * 1.5
            );

            group.appendChild(rung);
        }

        visualLayer.appendChild(group);

    }

    function drawSnake(x1, y1, x2, y2) {

        if (!visualLayer) return;

        const ns =
            "http://www.w3.org/2000/svg";

        const path =
            document.createElementNS(
                ns,
                "path"
            );

        const midX =
            (x1 + x2) / 2;

        const midY =
            (y1 + y2) / 2;

        const curve =
            10;

        const d = `
            M ${x1} ${y1}
            Q ${midX + curve} ${midY - curve}
              ${x2} ${y2}
        `;

        path.setAttribute("d", d);

        path.setAttribute(
            "class",
            "board-snake"
        );

        visualLayer.appendChild(path);

    }

    /* =====================================================
       ROLL DICE
       ===================================================== */

    function rollDice() {

        if (!gameRunning) return;

        if (rolling) return;

        const player =
            players[currentPlayer];

        if (!player) return;

        if (player.isAI) return;

        rolling = true;

        rollButton.disabled = true;

        turnStatus.textContent =
            "Rolling...";

        playDiceSound();

        const result =
            Math.floor(Math.random() * 6) + 1;

        animateDice(result);

        setTimeout(() => {

            movePlayer(player, result);

        }, motionEnabled ? 600 : 100);

    }

    /* =====================================================
       DICE ANIMATION
       ===================================================== */

    function animateDice(value) {

        if (!diceCube) return;

        /*
           Remove old animation classes.
        */

        diceCube.classList.remove(
            "rolling",
            "show-1",
            "show-2",
            "show-3",
            "show-4",
            "show-5",
            "show-6"
        );

        if (motionEnabled) {

            diceCube.classList.add("rolling");

        }

        setTimeout(() => {

            diceCube.classList.remove("rolling");

            diceCube.classList.add(
                `show-${value}`
            );

        }, motionEnabled ? 500 : 0);

    }

    /* =====================================================
       MOVE PLAYER
       ===================================================== */

    async function movePlayer(player, diceValue) {

        const oldPosition =
            player.position;

        let newPosition =
            oldPosition + diceValue;

        player.moves++;

        totalMoves++;

        addLog(
            `<strong>${player.name}</strong> rolled ${diceValue}.`
        );

        /*
           Exact 100 required.
        */

        if (newPosition > 100) {

            addLog(
                `${player.name} needs an exact roll to reach 100.`
            );

            turnStatus.textContent =
                `Rolled ${diceValue}. Need exact 100.`;

            updateMoveCount();

            await delay(500);

            finishTurn();

            return;
        }

        /* Move one square at a time */

        if (motionEnabled) {

            await animatePlayerMovement(
                player,
                newPosition
            );

        } else {

            player.position =
                newPosition;

            renderPieces();

        }

        /* Check ladder */

        if (ladders[player.position]) {

            const ladderStart =
                player.position;

            const ladderEnd =
                ladders[player.position];

            player.ladders++;

            addLog(
                `<strong>${player.name}</strong> climbed the ladder from ${ladderStart} to ${ladderEnd}!`
            );

            showToast(
                "🪜 Ladder! Climb up!",
                "success"
            );

            playLadderSound();

            await delay(
                motionEnabled ? 500 : 100
            );

            player.position =
                ladderEnd;

            renderPieces();

        }

        /* Check snake */

        else if (snakes[player.position]) {

            const snakeStart =
                player.position;

            const snakeEnd =
                snakes[player.position];

            player.snakes++;

            addLog(
                `<strong>${player.name}</strong> was bitten! ${snakeStart} → ${snakeEnd}`
            );

            showToast(
                "🐍 Oh no! Snake!",
                "warning"
            );

            playSnakeSound();

            await delay(
                motionEnabled ? 500 : 100
            );

            player.position =
                snakeEnd;

            renderPieces();

        }

        updateTurnUI();

        /* Winner */

        if (player.position === 100) {

            player.finished = true;

            gameRunning = false;

            rolling = false;

            rollButton.disabled = true;

            updateTurnUI();

            setTimeout(() => {

                showWinner(player);

            }, motionEnabled ? 400 : 0);

            return;
        }

        updateMoveCount();

        await delay(400);

        finishTurn();

    }

    /* =====================================================
       ANIMATED PLAYER MOVEMENT
       ===================================================== */

    async function animatePlayerMovement(
        player,
        targetPosition
    ) {

        const start =
            player.position;

        const direction =
            targetPosition > start
                ? 1
                : -1;

        for (
            let position = start + direction;
            position !== targetPosition + direction;
            position += direction
        ) {

            player.position =
                position;

            renderPieces();

            await delay(120);

        }

    }

    /* =====================================================
       FINISH TURN
       ===================================================== */

    function finishTurn() {

        if (!gameRunning) return;

        rolling = false;

        currentPlayer++;

        if (
            currentPlayer >= players.length
        ) {
            currentPlayer = 0;
        }

        updateTurnUI();

        rollButton.disabled = false;

        const player =
            players[currentPlayer];

        addLog(
            `<strong>${player.name}</strong>'s turn.`
        );

        if (player.isAI) {

            rollButton.disabled = true;

            turnStatus.textContent =
                "AI is thinking...";

            setTimeout(() => {

                aiRoll();

            }, 1000);

        } else {

            showToast(
                `${player.name}'s turn`,
                "success"
            );

        }

    }

    /* =====================================================
       AI
       ===================================================== */

    function aiRoll() {

        if (!gameRunning) return;

        const player =
            players[currentPlayer];

        if (!player || !player.isAI) return;

        rolling = true;

        const value =
            Math.floor(Math.random() * 6) + 1;

        animateDice(value);

        playDiceSound();

        setTimeout(() => {

            moveAIPlayer(
                player,
                value
            );

        }, motionEnabled ? 600 : 100);

    }

    async function moveAIPlayer(
        player,
        diceValue
    ) {

        await movePlayer(
            player,
            diceValue
        );

    }

    /* =====================================================
       RENDER PIECES
       ===================================================== */

    function renderPieces() {

        if (!piecesLayer) return;

        piecesLayer.innerHTML = "";

        players.forEach((player, index) => {

            if (player.finished) return;

            const piece =
                document.createElement("div");

            piece.className =
                "game-piece";

            piece.dataset.player =
                player.id;

            piece.textContent =
                index + 1;

            piece.style.background =
                player.color;

            /*
               Position piece using percentage.
            */

            const coordinate =
                getBoardCoordinate(
                    player.position
                );

            /*
               Offset multiple pieces
               that are on same square.
            */

            const samePositionPlayers =
                players.filter(
                    p =>
                        p.position ===
                        player.position
                );

            const sameIndex =
                samePositionPlayers.indexOf(
                    player
                );

            const offsets = [
                [-2, -2],
                [2, -2],
                [-2, 2],
                [2, 2],
                [0, 0],
                [0, 3]
            ];

            const offset =
                offsets[sameIndex] ||
                [0, 0];

            piece.style.left =
                `calc(${coordinate.x}% + ${offset[0]}%)`;

            piece.style.top =
                `calc(${coordinate.y}% + ${offset[1]}%)`;

            piecesLayer.appendChild(piece);

        });

    }

    /* =====================================================
       PLAYER LIST
       ===================================================== */

    function renderPlayers() {

        if (!playersList) return;

        playersList.innerHTML = "";

        players.forEach(
            (player, index) => {

                const row =
                    document.createElement("div");

                row.className =
                    "player-row";

                if (
                    index === currentPlayer
                ) {
                    row.classList.add("active");
                }

                const percentage =
                    player.position;

                row.innerHTML = `
                    <span class="avatar"
                          style="background:${player.color}">
                        ${index + 1}
                    </span>

                    <div class="player-info">

                        <strong>
                            ${player.name}
                            ${
                                player.isAI
                                    ? "<small>AI</small>"
                                    : ""
                            }
                        </strong>

                        <div class="position">
                            ${player.position} / 100
                        </div>

                        <div class="progress">
                            <span
                                style="
                                    width:${percentage}%;
                                    background:${player.color};
                                ">
                            </span>
                        </div>

                        <div class="player-stats-inline">

                            <span>
                                🎲 ${player.moves}
                            </span>

                            <span>
                                🪜 ${player.ladders}
                            </span>

                            <span>
                                🐍 ${player.snakes}
                            </span>

                        </div>

                    </div>
                `;

                playersList.appendChild(row);

            }
        );

    }

    /* =====================================================
       UPDATE TURN UI
       ===================================================== */

    function updateTurnUI() {

        const player =
            players[currentPlayer];

        if (!player) return;

        turnName.textContent =
            player.name;

        turnAvatar.textContent =
            currentPlayer + 1;

        turnAvatar.style.background =
            player.color;

        turnPosition.textContent =
            `${player.position} / 100`;

        if (player.isAI) {

            turnStatus.textContent =
                "AI turn";

        } else {

            turnStatus.textContent =
                "Ready to roll?";

        }

        turnHeadline.textContent =
            `${player.name}'s turn. Roll the dice and make your move.`;

        renderPlayers();

        renderPieces();

    }

    /* =====================================================
       MOVE COUNT
       ===================================================== */

    function updateMoveCount() {

        if (!moveCountElement) return;

        moveCountElement.textContent =
            `${totalMoves} ${
                totalMoves === 1
                    ? "move"
                    : "moves"
            }`;

        renderPlayers();

    }

    /* =====================================================
       WINNER
       ===================================================== */

    function showWinner(player) {

        winnerModal.hidden = false;

        winnerAvatar.textContent =
            player.id + 1;

        winnerAvatar.style.background =
            player.color;

        winnerTitle.textContent =
            `${player.name} wins!`;

        statMoves.textContent =
            player.moves;

        statLadders.textContent =
            player.ladders;

        statSnakes.textContent =
            player.snakes;

        createConfetti();

        playWinSound();

        addLog(
            `<strong>🏆 ${player.name} WON THE GAME!</strong>`
        );

    }

    /* =====================================================
       CONFETTI
       ===================================================== */

    function createConfetti() {

        if (!confettiContainer) return;

        confettiContainer.innerHTML = "";

        if (!motionEnabled) return;

        for (let i = 0; i < 40; i++) {

            const piece =
                document.createElement("span");

            piece.className =
                "confetti-piece";

            piece.textContent =
                Math.random() > 0.5
                    ? "✦"
                    : "•";

            piece.style.left =
                `${Math.random() * 100}%`;

            piece.style.top =
                `${Math.random() * 20}%`;

            piece.style.animationDelay =
                `${Math.random() * 1.5}s`;

            piece.style.fontSize =
                `${8 + Math.random() * 14}px`;

            confettiContainer.appendChild(
                piece
            );

        }

    }

    /* =====================================================
       LOG
       ===================================================== */

    function addLog(message) {

        if (!gameLog) return;

        const entry =
            document.createElement("div");

        entry.className =
            "log-entry";

        entry.innerHTML =
            message;

        gameLog.prepend(entry);

        /*
           Keep log small.
        */

        while (
            gameLog.children.length > 30
        ) {

            gameLog.removeChild(
                gameLog.lastChild
            );

        }

    }

    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        if (!toastRegion) return;

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type}`;

        toast.textContent =
            message;

        toastRegion.appendChild(toast);

        setTimeout(() => {

            toast.remove();

        }, 2800);

    }

    /* =====================================================
       SHOW SETUP
       ===================================================== */

    function showSetup() {

        gameRunning = false;
        rolling = false;

        winnerModal.hidden = true;
        exitModal.hidden = true;

        setupScreen.hidden = false;
        gameScreen.hidden = true;

        createPlayerConfig();

        showToast(
            "Back to game setup.",
            "success"
        );

    }

    /* =====================================================
       SOUND
       ===================================================== */

    function getAudioContext() {

        if (!audioContext) {

            const AudioCtx =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioCtx) return null;

            audioContext =
                new AudioCtx();

        }

        return audioContext;

    }

    function playTone(
        frequency,
        duration = 0.1,
        type = "sine",
        volume = 0.04
    ) {

        if (!soundEnabled) return;

        const ctx =
            getAudioContext();

        if (!ctx) return;

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type =
            type;

        oscillator.frequency.value =
            frequency;

        gain.gain.value =
            volume;

        oscillator.connect(gain);

        gain.connect(ctx.destination);

        const now =
            ctx.currentTime;

        gain.gain.setValueAtTime(
            volume,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        oscillator.start(now);

        oscillator.stop(
            now + duration
        );

    }

    function playClickSound() {

        playTone(
            500,
            0.06,
            "sine",
            0.025
        );

    }

    function playDiceSound() {

        if (!soundEnabled) return;

        for (let i = 0; i < 5; i++) {

            setTimeout(() => {

                playTone(
                    250 + Math.random() * 200,
                    0.06,
                    "square",
                    0.018
                );

            }, i * 80);

        }

    }

    function playLadderSound() {

        if (!soundEnabled) return;

        playTone(500, 0.12);
        setTimeout(
            () => playTone(700, 0.12),
            100
        );
        setTimeout(
            () => playTone(900, 0.18),
            200
        );

    }

    function playSnakeSound() {

        if (!soundEnabled) return;

        playTone(
            300,
            0.15,
            "sawtooth",
            0.025
        );

        setTimeout(
            () =>
                playTone(
                    180,
                    0.25,
                    "sawtooth",
                    0.025
                ),
            150
        );

    }

    function playWinSound() {

        if (!soundEnabled) return;

        const notes = [
            523,
            659,
            784,
            1047
        ];

        notes.forEach(
            (frequency, index) => {

                setTimeout(() => {

                    playTone(
                        frequency,
                        0.3,
                        "sine",
                        0.05
                    );

                }, index * 140);

            }
        );

    }

    function playStartSound() {

        if (!soundEnabled) return;

        playTone(
            600,
            0.12,
            "sine",
            0.03
        );

        setTimeout(
            () =>
                playTone(
                    800,
                    0.15,
                    "sine",
                    0.03
                ),
            100
        );

    }

    /* =====================================================
       SOUND TOGGLE
       ===================================================== */

    function toggleSound() {

        soundEnabled =
            !soundEnabled;

        soundSetting.checked =
            soundEnabled;

        updateSoundButton();

        saveSettings();

        if (soundEnabled) {

            playClickSound();

            showToast(
                "Sound enabled",
                "success"
            );

        } else {

            showToast(
                "Sound muted",
                "warning"
            );

        }

    }

    function updateSoundButton() {

        if (!soundButton) return;

        soundButton.setAttribute(
            "aria-label",
            soundEnabled
                ? "Mute sound"
                : "Enable sound"
        );

        soundButton.title =
            soundEnabled
                ? "Mute sound"
                : "Enable sound";

        const waves =
            soundButton.querySelectorAll(
                ".sound-wave"
            );

        waves.forEach(
            wave => {

                wave.style.display =
                    soundEnabled
                        ? ""
                        : "none";

            }
        );

    }

    /* =====================================================
       THEME
       ===================================================== */

    function toggleTheme() {

        const dark =
            document.body.classList.toggle(
                "dark"
            );

        themeButton.setAttribute(
            "aria-label",
            dark
                ? "Switch to light theme"
                : "Switch to dark theme"
        );

        themeButton.title =
            dark
                ? "Switch to light theme"
                : "Switch to dark theme";

        localStorage.setItem(
            "snakesTheme",
            dark ? "dark" : "light"
        );

        playClickSound();

    }

    /* =====================================================
       SETTINGS
       ===================================================== */

    function saveSettings() {

        localStorage.setItem(
            "snakesSound",
            soundEnabled
        );

        localStorage.setItem(
            "snakesMotion",
            motionEnabled
        );

    }

    function loadSettings() {

        const savedSound =
            localStorage.getItem(
                "snakesSound"
            );

        const savedMotion =
            localStorage.getItem(
                "snakesMotion"
            );

        const savedTheme =
            localStorage.getItem(
                "snakesTheme"
            );

        if (savedSound !== null) {

            soundEnabled =
                savedSound !== "false";

        }

        if (savedMotion !== null) {

            motionEnabled =
                savedMotion !== "false";

        }

        if (savedTheme === "dark") {

            document.body.classList.add(
                "dark"
            );

        }

        soundSetting.checked =
            soundEnabled;

        motionSetting.checked =
            motionEnabled;

        document.body.classList.toggle(
            "reduce-motion",
            !motionEnabled
        );

        updateSoundButton();

    }

    /* =====================================================
       DELAY
       ===================================================== */

    function delay(ms) {

        return new Promise(
            resolve =>
                setTimeout(resolve, ms)
        );

    }

});
