import React, { useEffect, useState } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import { useDispatch, useSelector } from 'react-redux'
import { selectSnacks, removeSnack } from '../slices/snackSlice'
import MuiAlert from '@material-ui/lab/Alert'

function Alert(props) { return <MuiAlert elevation={6} variant="filled" {...props} /> }

export default function ConsecutiveSnackbars() {
  const dispatch = useDispatch()
  const snackPack = useSelector(selectSnacks)

  const [open, setOpen] = useState()
  const [snack, setSnack] = useState()

  useEffect(() => {
    if (snackPack.length && !snack) {
      // Set a new snack when we don't have an active one
      setSnack({ ...snackPack[0] })
      dispatch(removeSnack(snackPack[0].id))
      setOpen(true)
    } else if (snackPack.length && snack && open) {
      setOpen(false)
    }
  }, [snackPack, snack, open, dispatch])

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return

    setOpen(false)
  }

  const handleExited = () => { setSnack(undefined) }

  return <Snackbar
    key={snack ? snack.id : undefined}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    open={open}
    autoHideDuration={3000}
    onClose={handleClose}
    onExited={handleExited}
  >
    <Alert onClose={handleClose} severity={ snack && snack.severity || "success" } key={snack ? snack.id : undefined}>
      { '' + (snack && snack.value || '') }
    </Alert>
  </Snackbar>
}
