const request = require("supertest");
const app = require("../..");
const { clearDatabase } = require('../../db.connection')

const req = request(app);

describe("lab testing:", () => {

    describe("users routes:", () => {
        let fakeUser;
        beforeAll(() => {
            fakeUser = { name: "ali", email: "ali@gmail.com", password: "asd123" };
        });
        afterAll(async () => {
            await clearDatabase();
        });
        // Note: user name must be sent in req query not req params
        it("req to get(/user/search) ,expect to get the correct user with his name", async () => {
            const res = await req.get("/user/search").query({ name: fakeUser.name });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe(fakeUser.name);
        })
        it("req to get(/user/search) with invalid name ,expect res status and res message to be as expected", async () => {
            const res = await req.get("/user/search").query({ name: "InvalidUser" });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("User not found");
        })

    })


    describe("todos routes:", () => {
        let fakeUser, userToken, todoId;
        beforeAll(async () => {
            fakeUser = { name: "ali", email: "ali@gmail.com", password: "asd123" };
            await req.post("/user/signup").send(fakeUser);
            let loginRes = await req.post("/user/login").send(fakeUser);
            userToken = loginRes.body.data;
            const todoRes = await req.post("/todo").set("Authorization", userToken).send({ title: "Initial Todo" });
            todoId = todoRes.body.data._id;
        })
        afterAll(async () => {
            await clearDatabase();
        })
        it("req to patch( /todo/) with id only ,expect res status and res message to be as expected", async () => {
            const res = await req.patch(`/todo/${todoId}`).send({ id: todoId }).set("Authorization", userToken);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Title is required");
        })
        it("req to patch( /todo/) with id and title ,expect res status and res to be as expected", async () => {
            const res = await req.patch(`/todo/${todoId}`).send({ id: todoId, title: "New Title" }).set("Authorization", userToken);
            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe("New Title");
        })

        it("req to get( /todo/user) ,expect to get all user's todos", async () => {
            const res = await req.get("/todo/user").set("Authorization", userToken);
            expect(res.status).toBe(200);
            expect(res.body.data.some((todo) => todo._id === todoId)).toBe(true);
        })
        it("req to get( /todo/user) ,expect to not get any todos for user hasn't any todo", async () => {
            await clearDatabase();
            const res = await req.get("/todo/user").set("Authorization", userToken);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("No todos found");
        })

    })

    // afterAll(async () => {
    //     await clearDatabase()
    // })


})