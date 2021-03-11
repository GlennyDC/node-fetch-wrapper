import { Api } from "./api";

const MOCK_SERVER = "https://jsonplaceholder.typicode.com/";

describe("Api class", () => {
  test("the addition of 0 and 5 is 5", async () => {
    const api = Api.init(MOCK_SERVER);
    const posts = await api.get("posts");
    console.log(posts);
  });
});
