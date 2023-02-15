import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import db from '../firebase.config';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { evaluate } from 'mathjs'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';



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

function getSteps() {
  return ['Price List', 'Shipping Details', 'Shipping Weight & Cost'];
}


export default function AddShipping(props) {
  const classes = useStyles();
  const [customers, setCustomers] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [customer, setCustomer] = React.useState({});
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [country, setCountry] = React.useState({});
  const [fc, setFC] = React.useState(0);
  const [rate, setRate] = React.useState(15.8);
  const [cost, setCost] = React.useState(0);
  const [dollarCost, setDollarCost] = React.useState(0);
  const [sale, setSale] = React.useState(0);
  const [dollarSale, setDollarSale] = React.useState(0);
  const [weight, setWeight] = React.useState(0);
  const [skyAWB, setSkyAWB] = React.useState('');
  const [awb, setAWB] = React.useState('');
  const [isDoc, setIsDoc] = React.useState(false)
  const [priceList, setPriceList] = React.useState(1);
  const [activeStep, setActiveStep] = React.useState(0);
  const [extraFees, setExtraFees] = React.useState(0);
  const [direction, setdirection] = React.useState('dest');
  const [status, setStatus] = React.useState(1);
  const [valid, setValid] = React.useState(false);
  const [defaultFC, setDefaultFC] = React.useState(0);

  const steps = getSteps();

  const handleNext = () => {
    if (activeStep === 1) {
      validAWB()
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if (activeStep === steps.length - 1) {
      confirm();
      setActiveStep(0);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleListChange = (event) => {
    setPriceList(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const validAWB = () => {
    db.collection("shippings")
      .where("AWB", "==", awb)
      .get()
      .then((querySnapshot => {
        if (querySnapshot.size > 0) {
          alert('AWB already exists!')
          setValid(false);
        } else {
          db.collection("shippings")
            .where("skyAWB", "==", skyAWB)
            .get()
            .then((query) => {
              if (query.size > 0) {
                alert('skyAWB already exists!')
                setValid(false)
              } else {
                setValid(true)
              }
            })
        }
      }))
  }

  const calculateCost = (z, w, ef, f, r, isD) => {
    if (w && z && r && f && direction === 'dest' && customer.code !== '10000') {
      db.collection("prices")
        .where("zone", "==", z.trim())
        .where("priceList", "==", priceList)
        .where("isDoc", "==", priceList === 2 ? isD : false)
        .get()
        .then((querySnapshot) => {
          var cost;
          querySnapshot.forEach((doc) => {
            if (Number(w) > Number(doc.data().weightFrom) && Number(w) <= Number(doc.data().weightTo)) {
              if (Number(w) > 30) {
                cost = evaluate(doc.data().cost.replace("n", w));
              } else {
                cost = Number(doc.data().cost)
              }
            }
          });
          cost = (((cost * Number(f)) * 1.14) * 1.1) + ((Number(ef) * Number(f)) * 1.14)
          setDollarCost(cost.toFixed(2))
          setCost((cost * Number(r)).toFixed(2))
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }

  const confirm = () => {
    db.collection("shippings").add({
      skyAWB: skyAWB,
      AWB: awb,
      destination: country.country,
      zone: country.zone,
      customerCode: customer.code,
      customerName: customer.name,
      cost: Number(cost).toFixed(2),
      dollarCost: Number(dollarCost).toFixed(2),
      sale: Number(sale).toFixed(2),
      dollarSale: Number(dollarSale).toFixed(2),
      weight: Number(weight),
      rate: Number(rate),
      fc: Number(fc),
      createDate: selectedDate,
      isDoc: isDoc,
      vat: ((Number(cost) / 1.1) * 0.1).toFixed(2),
      vatDollar: ((Number(dollarCost) / 1.1) * 0.1).toFixed(2),
      fees: (((Number(cost) / 1.1) / 1.4) * 0.14).toFixed(2),
      feesDollar: (((Number(dollarCost) / 1.1) / 1.4) * 0.14).toFixed(2),
      priceList: priceList,
      extraFees: Number(extraFees),
      status: status,
      direction: direction,
      statusChangeDate: new Date()
    })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        alert('Shipping is added successfully!')
        reset();
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  const reset = () => {
    setCustomer({});
    setCountry({});
    setSelectedDate(new Date());
    setFC(1.23);
    setRate(15.8);
    setCost(0);
    setDollarCost(0);
    setSale(0);
    setDollarSale(0);
    setWeight(0);
    setSkyAWB('');
    setAWB('');
    setIsDoc(false);
    setExtraFees(0);
    setStatus(1);
    setdirection('dest');
  }

  const checkDisabled = () => {
    if (activeStep === 1) {
      return (Object.keys(customer).length === 0 ||
        Object.keys(country).length === 0 || !skyAWB || !awb)
    }
    if (activeStep === 2) {
      return !fc || !rate || !weight || !valid;
    }
    return false;
  }

  React.useEffect(() => {
    async function fetchShipping() {

      db.collection('constants').doc('FC').get().then((doc) => {
        if (doc.exists) {
          const data = doc.data()
          setFC(data.value)
          setDefaultFC(data.value)
        }
      })
      let customersRes = await db.collection("customers").orderBy("code").get().then((querySnapshot) => {
        var customersList = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().code) {
            customersList.push(doc.data());
          }
        });
        return customersList;
      });

      let countriesRes = await db.collection("countries").where("priceList", "==", priceList === 3 ? 2 : 1).get().then((querySnapshot) => {
        var countriesList = [];
        querySnapshot.forEach((doc) => {
          countriesList.push(doc.data());
        });
        return countriesList;
      });

      setCustomers(customersRes)
      setCountries(countriesRes)
    }

    fetchShipping()
  }, [priceList])

  const setdefaultFCDB = () => {
    db.collection("constants").doc("FC").set({
      value: defaultFC,
    }).then(function () {
      alert('Default FC is updated successfully!')
    });
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <div style={{ 'padding-left': '15px', 'text-align': 'right' }}>
        <TextField style={{ 'width': '100px' }}
          id="standard-name"
          label="Default FC"
          value={defaultFC}
          type="number"
          onChange={(event) => {
            setDefaultFC(event.target.value)
          }
          }
        />
        <Button style={{ 'height': '40px', 'align-self': 'center', 'margin-right': '15px' }} variant="contained" color="primary" onClick={() => { setdefaultFCDB() }}>
          Set Default FC
        </Button>
      </div>
      <div className={classes.root}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <div>
              <Typography className={classes.instructions}>Shipping is added successfully!</Typography>
            </div>
          ) : (
            <div>
              <Typography className={classes.instructions}>{activeStep === 0 ? (
                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label">Price List</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={priceList}
                    onChange={handleListChange}
                  >
                    <MenuItem value={1}>DHL</MenuItem>
                    <MenuItem value={2}>UPS</MenuItem>
                    <MenuItem value={3}>Aramex</MenuItem>
                  </Select>
                </FormControl>
              ) : activeStep === 1 ? (
                <Grid container spacing={3}>
                  <Grid container item xs={12} sm={12}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Date picker inline"
                        value={selectedDate}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField id="awbSky" name="awbSky" label="AWB Sky" value={skyAWB}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(event) => {
                        setSkyAWB(event.target.value)
                      }} />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField id="awb" name="awb" label="AWB" value={awb}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(event) => {
                        setAWB(event.target.value)
                      }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      id="combo-box"
                      options={customers}
                      getOptionLabel={(option) => option.code || ''}
                      value={customer}
                      onChange={(event, newValue) => {
                        if (!newValue) setCustomer({});
                        else setCustomer(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} label="Customer Code" variant="outlined" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      value={customer.name || ''}
                      label="Name"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={true}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <RadioGroup aria-label="direction" name="direction" value={direction} onChange={(event) => {
                      setdirection(event.target.value)
                    }}>
                      <FormControlLabel value="dest" control={<Radio />} label="Destination" />
                      <FormControlLabel value="origin" control={<Radio />} label="Origin" />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={countries}
                      value={country}
                      getOptionLabel={(option) => option.country || ''}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          if (priceList === 2 && newValue.zone === '8') {
                            setCountry({ country: newValue.country, zone: "7" })
                          }
                          else setCountry(newValue);
                        }
                        else setCountry({});
                      }}
                      renderInput={(params) => <TextField {...params} label="Country" variant="outlined" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      value={country.zone || ''}
                      label="Zone"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={true}
                      onChange={(event, newValue) => {
                        calculateCost(newValue, weight, extraFees, fc, rate, isDoc)
                      }}
                    />
                  </Grid>
                </Grid>
              ) : activeStep === 2 ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="weight"
                      name="weight"
                      label="Weight"
                      value={weight}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Kg</InputAdornment>,
                      }}
                      type="number"
                      onChange={(event) => {
                        setWeight(event.target.value);
                        calculateCost(country.zone, event.target.value, extraFees, fc, rate, isDoc);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="extraFees"
                      name="extraFees"
                      label="Extra Fees"
                      value={extraFees}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      type="number"
                      onChange={(event) => {
                        setExtraFees(event.target.value);
                        calculateCost(country.zone, weight, event.target.value, fc, rate, isDoc);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      label="FC"
                      value={fc}
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(event) => {
                        setFC(event.target.value)
                        calculateCost(country.zone, weight, extraFees, event.target.value, rate, isDoc);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      label="$ Rate"
                      value={rate}
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(event) => {
                        setRate(event.target.value)
                        calculateCost(country.zone, weight, extraFees, fc, event.target.value, isDoc);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      label="Cost"
                      value={cost}
                      disabled={direction === 'dest' && customer.code !== '10000'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">LE</InputAdornment>,
                      }}
                      type="number"
                      onChange={(event) => {
                        setCost(event.target.value)
                        if (direction !== 'dest' || customer.code === '10000') {
                          var dollar = Number(event.target.value) / rate;
                          setDollarCost(dollar.toFixed(2))
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      label="Cost"
                      value={dollarCost}
                      disabled={direction === 'dest' && customer.code !== '10000'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      type="number"
                      onChange={(event) => {
                        setDollarCost(event.target.value)
                        if (direction !== 'dest' || customer.code === '10000') {
                          var egp = Number(event.target.value) * rate;
                          setCost(egp.toFixed(2))
                        }
                      }}
                    />
                  </Grid>


                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      label="Sale Price"
                      value={sale}
                      disabled={customer.code !== '10000'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">LE</InputAdornment>,
                      }}
                      type="number"
                      onChange={(event) => {
                        setSale(event.target.value)
                        if (customer.code === '10000') {
                          var dollar = Number(event.target.value) / rate;
                          setDollarSale(dollar.toFixed(2))
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="filled-name"
                      label="Sale Price"
                      value={dollarSale}
                      disabled={customer.code !== '10000'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      type="number"
                      onChange={(event) => {
                        setDollarSale(event.target.value)
                        if (customer.code === '10000') {
                          var egp = Number(event.target.value) * rate;
                          setSale(egp.toFixed(2))
                        }
                      }}
                    />
                  </Grid>


                  <Grid item xs={12} sm={12}>
                    <FormControlLabel style={{ 'color': 'black' }}
                      control={
                        <Checkbox
                          checked={isDoc}
                          onChange={(event) => {
                            setIsDoc(event.target.checked)
                            calculateCost(country.zone, weight, extraFees, fc, rate, isDoc)
                          }}
                          name="checkedB"
                          color="primary"
                        />
                      }
                      label="Document"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <FormControl className={classes.formControl}>
                      <InputLabel id="demo-simple-select-label">Shipping Status</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={status}
                        onChange={(event) => {
                          setStatus(event.target.value)
                        }}
                      >
                        <MenuItem value={1}>Picked Up</MenuItem>
                        <MenuItem value={2}>Arrived at Cairo</MenuItem>
                        <MenuItem value={3}>Departed Facility in Cairo</MenuItem>
                        <MenuItem value={4}>Arrived at Final Destination</MenuItem>
                        <MenuItem value={5}>Delivered</MenuItem>
                        <MenuItem value={6}>Need Correct Address</MenuItem>
                        <MenuItem value={7}>Held at Customs</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              ) : <div />}</Typography>
              <div style={{ 'bottom': '20px' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.backButton}
                >
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleNext}
                  disabled={checkDisabled()}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}