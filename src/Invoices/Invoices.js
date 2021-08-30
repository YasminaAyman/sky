import db from '../firebase.config';
import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import * as moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import EditInvoice from './EditInvoice';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Invoice from './Invoice';
import PropTypes from 'prop-types';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const columns = [
  {
    key: '1',
    id: 'invoiceNumber',
    label: 'Invoice Number',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '2',
    id: 'date',
    label: 'Date',
    minWidth: 170,
    format: (value) => getDate(value),
    align: 'center',
  },
  {
    key: 'code',
    label: 'Customer Code',
    id: 'customer',
    minWidth: 90,
    align: 'center',
  },
  {
    key: 'name',
    label: 'Customer Name',
    id: 'customer',
    minWidth: 170,
    align: 'center',
  },
  {
    key: '5',
    id: 'rate',
    label: 'Rate',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '6',
    id: 'fc',
    label: 'Fuel Charge',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '7',
    label: 'Total Amount (EGP)',
    id: 'totalAmount',
    minWidth: 90,
    align: 'center',
    format: (value) => Number(value).toFixed(1),
  },
  {
    key: '8',
    id: 'totalWeight',
    label: 'Total Weight (KG)',
    minWidth: 70,
    align: 'center',
    format: (value) => Number(value).toFixed(1),
  }
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const getDate = (val) => {
  var date = new Date(val * 1000);
  return moment(date).format('DD/MM/YYYY').toString();
}

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#3f51b5',
    color: theme.palette.common.white,
    padding: 0
  },
  body: {
    fontSize: 14,
    padding: 0
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <StyledTableRow>
        {columns.map((column) => (
          <StyledTableCell
            key={column.key}
            align={column.align}
            style={{ minWidth: column.minWidth }}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
              {orderBy === column.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function Invoices() {
  const [open, setOpen] = useState(false);
  const [openFull, setOpenFull] = useState(false);
  const [invoices, setInvoices] = useState([])
  const [fetchingData, setFetchingData] = useState(true)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selectedRow, setSelectedRow] = React.useState({});

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const handleClickOpen = (row) => {
    setOpen(true);
    setSelectedRow(row);
  };

  const handleClickOpenFullDial = (row) => {
    setOpenFull(true);
    setSelectedRow(row);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseFull = () => {
    setOpenFull(false);
  };

  const updateTable = () => {
    setFetchingData(true);
  }

  const fetchInvoices = () => {
    const invoicesList = []
    return db.collection('invoices')
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          invoicesList.push({ ...doc.data(), id: doc.id });
        });
        return invoicesList;
      });
  }

  useEffect(() => {
    fetchInvoices().then((res) => {
      setInvoices(res);
      setFetchingData(false)
    });

  }, [fetchingData])

  const useStyles = makeStyles((theme) => ({
    table: {
      minWidth: 700,
    },
    root: {
      width: '100%',
    },
    container: {
      maxHeight: '100%',
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
  }));

  const classes = useStyles();


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteInvoices = (id) => {
    db.collection("invoices").doc(id).delete().then(() => {
      console.log("Document successfully deleted!");
      alert('Invoice is deleted successfully!');
      updateTable();

    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  }

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={invoices.length}
          />
          <TableBody>
            {stableSort(invoices, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell key={column.key} align={column.align}>
                          {column.id === 'date' ? column.format(value.seconds) : (column.id === 'customer' ? value[column.key] : (column.id === 'totalWeight' || column.id === 'totalAmount' ? column.format(value) : value))}
                        </StyledTableCell>
                      );
                    })}
                    <StyledTableCell style={{ 'width': '50px' }} >
                      <IconButton onClick={() => handleClickOpen(row)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Invoice {selectedRow.id}</DialogTitle>
                        <DialogContent>
                          <EditInvoice rowInvoice={selectedRow} closeDialog={handleClose} updateTable={updateTable} />
                        </DialogContent>
                        <DialogActions>
                        </DialogActions>

                      </Dialog>
                    </StyledTableCell>

                    <StyledTableCell style={{ 'width': '50px' }} >
                      <IconButton onClick={() => { if (window.confirm(`Are you sure you want to delete Invoice with Invoice Number ` + row.invoiceNumber + `?`)) deleteInvoices(row.id) }}>
                        <DeleteIcon color="primary" />
                      </IconButton>
                    </StyledTableCell>

                    <StyledTableCell style={{ 'width': '50px' }} >
                      <IconButton onClick={() => handleClickOpenFullDial(row)}>
                        <OpenInNewIcon color="primary" />
                      </IconButton>
                      <Dialog maxWidth="lg" open={openFull} onClose={handleCloseFull} TransitionComponent={Transition}>
                        <AppBar className={classes.appBar}>
                          <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleCloseFull} aria-label="close">
                              <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                              Invoice
                            </Typography>
                            {/* <Button autoFocus color="inherit" onClick={handleCloseFull}>
                              Download
                            </Button> */}
                          </Toolbar>
                        </AppBar>
                        <Invoice rowInvoice={selectedRow} closeDialog={handleCloseFull} />
                      </Dialog>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={invoices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );

}