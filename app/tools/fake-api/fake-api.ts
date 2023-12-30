import { APIFork } from "./createAPIProcess";
import { FakeAPI } from "./api";

const child = APIFork.child();

new FakeAPI();

child.events.onAPIReady();
