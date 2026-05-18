async function test() {
  const url = "https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/HisseTekil?hisse=TAVHL";
  const res = await fetch(url);
  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 300));
}
test();
