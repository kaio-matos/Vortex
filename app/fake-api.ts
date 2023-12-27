import { APIFork } from "./createAPIProcess";
import { FakeAPI } from "./tools/fake-api";

const child = APIFork.child();

new FakeAPI();

child.events.onAPIReady();
