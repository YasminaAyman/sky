import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import db from '../firebase.config';
import CssBaseline from '@material-ui/core/CssBaseline';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '600px'
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

export default function EditCustomer(props) {
  const rowCustomer = props.rowCustomer;
  const classes = useStyles();
  const [name, setName] = React.useState(rowCustomer.name);
  const [address, setAddress] = React.useState(rowCustomer.addr1);
  const [region, setRegion] = React.useState(rowCustomer.addr2);
  const [city, setCity] = React.useState(rowCustomer.addr3);
  const [contact, setContact] = React.useState(rowCustomer.contact);
  const [number, setNumber] = React.useState(rowCustomer.number);
  const [priceList, setPriceList] = React.useState(rowCustomer.priceList);
  const [taxable, setTaxable] = React.useState(rowCustomer.taxable);


  const save = () => {
    db.collection("customers").doc(rowCustomer.id).set({
      code: rowCustomer.code,
      name: name,
      addr1: address,
      addr2: region,
      addr3: city,
      contact: contact,
      number: number,
      taxable: taxable,
      priceList: priceList
    })
      .then(() => {
        alert('Customer is updated successfully!');
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.root}>
        <Grid container spacing={3}>
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
            <Button color="primary" size="medium" style={{ 'left': '7  0%' }} onClick={() => {
              props.closeDialog();
              save();
              props.updateTable();
            }}>
              Save
            </Button>
            <Button onClick={props.closeDialog} color="primary" size="medium" style={{ 'left': '80%' }}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  )

}