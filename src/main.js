import { print } from "./lib/test"

;(() => setTimeout(_ => print("Hello, world"), 3000))()
