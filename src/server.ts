import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
//
import docModel from "./Document";

mongoose.connect("mongodb://localhost/dox2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket: Socket) => {
  socket.on("get-document", async (id: string) => {
    const document = await handleDocument(id);

    socket.join(id);

    // console.log(document)

    socket.emit("load-document", document);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(id).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await docModel.findByIdAndUpdate(id, { data });
    });
  });
});

async function handleDocument(id: string) {
  if (id == null) return;

  const document = await docModel.findById(id);

  if (document) return document;

  return await docModel.create({ _id: id, data: defaultValue });
}
