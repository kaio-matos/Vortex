import HTTP from "node:http";

enum HTTPMethods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD",
    TRACE = "TRACE",
}

type HTTPIncomingMessage = typeof HTTP.IncomingMessage;
type HTTPServerResponse = typeof HTTP.ServerResponse;

interface ServerConfiguration<
    Request extends HTTPIncomingMessage = HTTPIncomingMessage,
    Response extends HTTPServerResponse = HTTPServerResponse
> {
    port: number;
    hostname: string;
    options: HTTP.ServerOptions<Request, Response>;
}

export class Server<
    Request extends HTTPIncomingMessage = HTTPIncomingMessage,
    Response extends HTTPServerResponse = HTTPServerResponse
> {
    protected configuration: ServerConfiguration<Request, Response>;
    protected server: HTTP.Server<Request, Response>;

    constructor(
        configuration?: Partial<ServerConfiguration<Request, Response>>
    ) {
        this.configuration = this.configure(configuration ?? {});

        this.server = HTTP.createServer<Request, Response>(
            this.configuration.options
        );

        this.server.listen(
            this.configuration.port,
            this.configuration.hostname,
            () => {
                console.log(
                    `Server running at http://${this.configuration.hostname}:${this.configuration.port}/`
                );
            }
        );
    }

    post(path: string) {
        return new RequestHandler(this.server, path, HTTPMethods.POST);
    }

    get(path: string) {
        return new RequestHandler(this.server, path, HTTPMethods.GET);
    }

    put(path: string) {
        return new RequestHandler(this.server, path, HTTPMethods.PUT);
    }

    patch(path: string) {
        return new RequestHandler(this.server, path, HTTPMethods.PATCH);
    }

    delete(path: string) {
        return new RequestHandler(this.server, path, HTTPMethods.DELETE);
    }

    middleware(md: HTTP.RequestListener<Request, Response>) {
        this.server.addListener("request", md);
    }

    private configure(
        configuration: Partial<ServerConfiguration<Request, Response>>
    ): ServerConfiguration<Request, Response> {
        const c = structuredClone(configuration);

        c.port = c.port ?? 9292;
        c.hostname = c.hostname ?? "127.0.0.1";
        c.options = { ...c.options };
        return c as ServerConfiguration<Request, Response>;
    }
}

class RequestHandler<
    Request extends HTTPIncomingMessage = HTTPIncomingMessage,
    Response extends HTTPServerResponse = HTTPServerResponse
> {
    private _middlewares: HTTP.RequestListener<Request, Response>[] = [];
    private _requestHandler:
        | HTTP.RequestListener<Request, Response>
        | undefined;

    constructor(
        protected server: HTTP.Server<Request, Response>,
        protected path: string,
        protected method: HTTPMethods
    ) {}

    middleware(callback: HTTP.RequestListener<Request, Response>) {
        this.server.addListener("request", (req, res) => {
            if (!this._isThisRequest(req, res)) return;
            callback(req, res);
        });
        this._middlewares.push(callback);
        return this;
    }

    handler(callback: HTTP.RequestListener<Request, Response>) {
        this.server.addListener("request", (req, res) => {
            if (!this._isThisRequest(req, res)) return;
            callback(req, res);
        });
        this._requestHandler = callback;
    }

    removeMiddlewares() {
        this._middlewares.forEach((md) =>
            this.server.removeListener("request", md)
        );
    }

    removeHandler() {
        if (!this._requestHandler) return;
        this.server.removeListener("request", this._requestHandler);
    }

    remove() {
        this.removeMiddlewares();
        this.removeHandler();
    }

    private _isThisRequest(
        ...[req, res]: Parameters<HTTP.RequestListener<Request, Response>>
    ): boolean {
        if (!req.url) return false;

        if (req.method?.toLowerCase() !== this.method.toLowerCase())
            return false;

        const url = new URL(req.url, `http://${req.headers.host}`);

        if (!url.pathname.includes(this.path)) return false;

        return true;
    }
}
