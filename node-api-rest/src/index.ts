import app, { PORT } from "./server";

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});