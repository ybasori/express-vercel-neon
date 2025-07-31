const app = require("@app/main");
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  //
  // eslint-disable-next-line no-console
  console.log(`> ready on http://localhost:${port}`);
});
