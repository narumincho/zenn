let log = "";

for (let i = 1; i < 2100; i++) {
  log += new Temporal.PlainDate(i, 1, 1).toLocaleString("ja-JP", {
    calendar: "japanese",
  }) + "\n";
  // log += new Temporal.PlainDate(i, 1, 1).toLocaleString('ja-JP-u-ca-japanese') + '\n';
}

Deno.writeTextFile("output.txt", log);
