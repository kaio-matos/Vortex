import { type ChildProcess, fork, type ForkOptions } from "node:child_process";

interface ForkEventData {
    event: string;
    arguments: any;
}

function isForkEventData(data: any): data is ForkEventData {
    return Boolean(data.event);
}

interface ForkEvent extends Record<string, (...args: any) => any> {}

class ForkParent<Listeners extends ForkEvent> {
    listeners: Listeners;

    constructor(protected child: ChildProcess) {
        this.listeners = {} as Listeners;

        child.on("message", (data) => {
            if (!isForkEventData(data)) return;

            if (this.listeners?.[data.event]) {
                const execute = this.listeners[data.event];

                execute(...data.arguments);
            }
        });
    }
}

class ForkChild<Events extends ForkEvent> {
    events: Events;

    constructor(protected process: NodeJS.Process, events: Events) {
        this.events = Object.entries(events).reduce((prev, [name, func]) => {
            return {
                ...prev,
                [name]: (...args: Parameters<typeof func>) => {
                    process.send?.({ event: name, arguments: args });
                    func(...args);
                },
            };
        }, {} as Events);
    }
}

export class Fork<Events extends ForkEvent> {
    constructor(
        protected modulePath: string,
        protected events: Events,
        protected options?: ForkOptions
    ) {}

    parent() {
        const child_process = fork(this.modulePath, this.options);
        return new ForkParent<Events>(child_process);
    }

    child() {
        return new ForkChild(process, this.events);
    }
}
