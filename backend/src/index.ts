import app from "./server";

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server running locally on http://localhost:${port}`);
});
