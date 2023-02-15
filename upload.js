<div>
<div>
<input type="file" onChange={async (e) => {
  e.preventDefault()
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = (e.target.result)
    var arr = text.split("\n")
    for (let i = 0; i < arr.length; i++) {
      var words = arr[i].split('\t');
      for (let j = 2; j < 10; j++) {
        console.log('from', words[0], 'to', words[1], 'cost', words[j])
        db.collection("prices").add({
          zone: String(j-1),
          weightFrom: String(Number(words[0].trim())),
          weightTo: String(Number(words[1].trim())),
          cost: words[j].trim(),
          priceList: 3,
          isDoc: false
        })
          .then(() => {
            console.log("Document successfully written!");
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      }
    }
  };
  reader.readAsText(e.target.files[0])
}} />
</div>

<div>
<input type="file" onChange={async (e) => {
  e.preventDefault()
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = (e.target.result)
    var arr = text.split("\n")
    for (let i = 0; i < arr.length; i++) {
      var words = arr[i].split('\t');
      console.log('country', words[0], 'zone', words[1])
      db.collection("countries").add({
        country: words[0],
        zone: words[1].trim(),
        priceList: 2
      })
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    }
  };
  reader.readAsText(e.target.files[0])
}} />
</div>

<div>
      <input type="file" onChange={async (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => {
          const text = (e.target.result)
          var arr = text.split("\n")
          for (let i = 0; i < arr.length; i++) {
            var words = arr[i].split('\t');
            console.log('customer', words[0], 'name', words[1])
            db.collection("customers").add({
              code: words[0] === "."? "" : words[0],
              name: words[1] === "."? "" : words[1],
              addr1: words[2] === "."? "" : words[2],
              addr2: words[3] === "."? "" : words[3],
              addr3: words[4] === "."? "" : words[4],
              contact: words[5] === "."? "" : words[5],
              number: words[6] === "."? "" : words[6],
              taxable: false,
              priceList: ""
            })
              .then(() => {
                console.log("Document successfully written!");
              })
              .catch((error) => {
                console.error("Error writing document: ", error);
              });
          }
        };
        reader.readAsText(e.target.files[0])
      }} />
      </div>

</div>
