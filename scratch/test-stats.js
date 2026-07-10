async function test() {
  const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=Arsenal%20vs%20Chelsea`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  if (searchData.event && searchData.event.length > 0) {
    const ev = searchData.event[0];
    console.log(ev);
  }
}
test();
