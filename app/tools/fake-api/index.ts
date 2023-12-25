import { Server } from "./server";
import products from "./database/products.json";

class FakeAPI {
    protected server: Server;

    constructor() {
        this.server = new Server();
        this.server.middleware((req, res) => {
            res.setHeader("Content-Type", "application/json");
        });

        this.server.get("/products").handler((req, res) => {
            res.statusCode = 200;
            res.end(JSON.stringify(products));
        });
    }
}

new FakeAPI();
