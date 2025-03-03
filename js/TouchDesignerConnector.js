class TouchDesignerConnector {
    constructor() {
        this.websocket = null;
        this.isConnected = false;
        this.port = 7000; // Default TouchDesigner WebSocket port
    }

    connect() {
        try {
            this.websocket = new WebSocket(`ws://localhost:${this.port}`);
            
            this.websocket.onopen = () => {
                this.isConnected = true;
                console.log('Connected to TouchDesigner');
            };

            this.websocket.onclose = () => {
                this.isConnected = false;
                console.log('Disconnected from TouchDesigner');
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            this.websocket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        } catch (error) {
            console.error('Connection Error:', error);
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            // Handle incoming TouchDesigner messages here
            console.log('Received message from TouchDesigner:', message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    sendData(data) {
        if (this.isConnected) {
            this.websocket.send(JSON.stringify(data));
        }
    }

    disconnect() {
        if (this.websocket) {
            this.websocket.close();
        }
    }
} 