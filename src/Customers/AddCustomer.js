import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import db from '../firebase.config';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '80%',
    margin: 'auto'
  },
  title: {
    'text-align': 'center',
    'color': '#3f51b5',
    'height': '100px'
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: '50%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));


export default function AddCustomer() {
  const classes = useStyles();
  const [newCode, setNewCode] = React.useState('');
  const [lastCode, setLastCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [city, setCity] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [priceList, setPriceList] = React.useState('');
  const [taxable, setTaxable] = React.useState(true);


  const addCustomer = async () => {
    const valid = await checkValidCustomer();
    if (!valid) {
      alert('There is a customer with that code!')
    } else {
      db.collection("customers").add({
        code: newCode,
        name: name,
        addr1: address,
        addr2: region,
        addr3: city,
        contact: contact,
        number: number,
        taxable: taxable,
        priceList: priceList
      })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          alert('Customer is added successfully!')
          if (newCode === lastCode) {
            db.collection("constants").doc('code').set({
              value: Number(lastCode) + 1
            })
          }
          reset();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }

  };

  const checkValidCustomer = async () => {
    let valid
    valid = await db.collection("customers")
      .where("code", "==", newCode)
      .get().then((querySnapshot) => {
        console.log('snap', querySnapshot.size)
        if (querySnapshot.size === 0) {
          return true
        }
        return false
      });
    return valid;
  }

  React.useEffect(() => {
    db.collection("constants").doc('code').get().then((doc) => {
      const data = doc.data()
      setLastCode(data.value)
      setNewCode(data.value)
    })
  }, [])

  const reset = () => {
    setNewCode(lastCode)
    setName('');
    setAddress('');
    setRegion('');
    setCity('');
    setContact('');
    setNumber('');
    setPriceList('');
    setTaxable(true);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Typography variant="h4" gutterBottom className={classes.title}>
        Add Customer
      </Typography>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid container item xs={12} sm={12}>
            <TextField id="code" name="code" label="Code" value={newCode}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setNewCode(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={12}>
            <TextField id="name" name="name" label="Name" value={name}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setName(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={12}>
            <TextField id="address" name="address" label="Address" value={address}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setAddress(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={6}>
            <TextField id="region" name="region" label="Region" value={region}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setRegion(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={6}>
            <TextField id="city" name="city" label="City" value={city}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setCity(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={6}>
            <TextField id="contact" name="contact" label="Contact Person" value={contact}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setContact(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={6}>
            <TextField id="phone" name="phone" label="Phone Number" value={number}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setNumber(event.target.value)
              }} />
          </Grid>
          <Grid container item xs={12} sm={12}>
            <div>
              <input type="file" onChange={async (e) => {
                e.preventDefault()
                const reader = new FileReader()
                reader.onload = async (e) => {
                  const text = (e.target.result)
                  setPriceList(text);
                };
                reader.readAsText(e.target.files[0])
              }} />
            </div>
          </Grid>
          <Grid container item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={taxable}
                  onChange={(event) => {
                    setTaxable(event.target.checked)
                  }}
                  name="checkedB"
                  color="primary"
                />
              }
              label="Taxable"
            />
          </Grid>
          <Grid item xs={12} sm={12} >
            <Button color="primary" size="medium" style={{ 'left': '7  0%' }} onClick={addCustomer}
              disabled={!newCode || !name || !address || !region || !city || !number}
            >
              Add
            </Button>
          </Grid>


        </Grid>
      </div>
    </React.Fragment>
  )

}