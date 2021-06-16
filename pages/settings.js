import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import Message from '../components/Layout/Message'
import { useDispatch } from 'react-redux'
import { useToken } from '../components/xsrf'
import { useDarkMode } from '../components/Layout/mui-theme'
import { addSnack, removeSnack } from '../components/slices/snackSlice'
import { fetch, formBody } from '../components/fetch'
import { trigger } from 'swr'
import Head from 'next/head'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import DeleteIcon from '@material-ui/icons/Delete'
import SettingsIcon from '@material-ui/icons/Settings'
import Container from '@material-ui/core/Container'
import Chip from '@material-ui/core/Chip'
import Autocomplete from '@material-ui/lab/Autocomplete'
import SaveIcon from '@material-ui/icons/Save'
import Alert from '@material-ui/lab/Alert'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

const useSettingsPageStyles = makeStyles((theme) => ({
    sectionTitle: { marginTop: '1.5em' },
    pageContainer: { marginBottom: '1.5em' },
    form: {
        '& > .MuiTextField-root': { 
            display: 'block',
            '& > .MuiInputBase-root': { width: '100%' }
        }
    },
    input: {
        width: '100%',
        marginBottom: theme.spacing(2)
    },
    providerList: {
        minHeight: '100px',
        maxHeight: '300px',
        overflow: 'auto',
        padding: '1em'
    },
    providerListItemWrapper: {
        marginBottom: theme.spacing(1)
    }, 
    providerListItem: { 
        display: 'flex',
        padding: '1em',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    textOverflowEllipsis: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    selectedProvider: {
        border: '3px solid ' + theme.palette.primary.main
    },
}))

function updateSettings (evt, options = {}) {
    // Prevent default form submission
    if (evt && evt.preventDefault) evt.preventDefault()

    // Grab the action and method from the form unless specified in options
    const form = evt && evt.target
    const action = '' + (options.action || form.getAttribute('action'))
    const method = '' + (options.method || form.getAttribute('method'))

    const values = Object.create(null)

    const inputs = form? 
        Array.prototype.slice.call(form.querySelectorAll('input')):
        null
    
    // Get input values
    if (inputs) inputs.forEach(function (input) {
        const name = input.getAttribute('name')
        if (name) values[name] = input.value
    })

    // Add additional values (i.e inputs without 'name' attribute)
    Object.assign(values, options.values || {})

    // Submit the form to the action url
    if (form) form.reset()

    return fetch(action, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody(values),
        method
        // Trigger a refresh of user session
    }).then(
        function (response) {
            trigger('/api/user')

            return response.json()
        },
        function (err) {
            trigger('/api/user')

            return { error: err || new Error('error') }
        }
    )
}

export default function SettingsPage (props) {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine
    const { user } = props

    return <>
        <Head>
            <title key="page-title">Settings | App</title>
            <meta key="page-description" name="Description" content="Settings | App"/>
        </Head>
    {
        !user? <Message>
            <Alert severity="warning">Please login to add providers.</Alert>
        </Message>:
        offline? <Message>
            <Alert severity="warning">An internet connection is required to update settings.</Alert>
        </Message>:
        <Page {...props}/>
    }
    </>
}


const DEFAULT_MODIFY_FORM_STATE = {
    id: '',
    url: '',
    title: '',
    streams: '',
    meta: '',
    collections: '',
    _csrf: ''
}

function Page ({ providers: unsorted_providers }) {
    const dispatch = useDispatch()
    const [selected_provider, setSelectedProvider] = useState()
    const [dark_mode, setDarkMode] = useDarkMode()

    const token = useToken()

    const formRef = useRef()
        
    const classes = useSettingsPageStyles()

    const submitDeleteProviderForm = useCallback(updateSettings, [])

    // Keep state for the controlled components of form (Add / Modify provider)
    const [formData, setFormData] = useState(DEFAULT_MODIFY_FORM_STATE)

    const setProviderFormInput = useCallback(function (name, value) {
        setFormData(function (state) {
            const modified_state = { ...state }

            if (hasOwnProperty.call(state, name)) modified_state[name] = value

            return modified_state
        })
    }, [])

    const onProviderFormInputChanged = useCallback(function (evt) {
        const element = evt.target
        const name = element.getAttribute('name')
        const value = element.value
        setProviderFormInput(name, value)
    }, [setProviderFormInput])

    const clearProviderForm = useCallback(function (/*evt*/) {
        setSelectedProvider(undefined)
        setFormData(DEFAULT_MODIFY_FORM_STATE)
    }, [])

    const submitProviderForm = useCallback(function (evt) {
        dispatch(addSnack({
            id: 'SAVING_PROVIDER',
            severity: 'info', 
            value: 'Saving changes' 
        }))

        updateSettings(evt, { values: formData }).then(
            function (response) {
                dispatch(removeSnack('SAVING_PROVIDER'))

                document.querySelector('#back-to-top-anchor').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                })

                if (response.error)
                    dispatch(addSnack({ severity: 'error', value: 'Failed to save changes' }))
                else
                    dispatch(addSnack({ value: 'Saved changes successfully'}))
            }
        )

        clearProviderForm()
    }, [formData, dispatch, clearProviderForm])

    // Sort providers
    const providers = useMemo(function () {
        if (unsorted_providers) return [...unsorted_providers].sort((a, b)=> a.id > b.id ? 1 : -1)
        else return unsorted_providers
    }, [unsorted_providers])

    return <Container maxWidth="md" className={classes.pageContainer}>
    <div>
        <Typography className={classes.sectionTitle} variant="h4" gutterBottom>Providers</Typography>
        <Paper className={classes.providerList} elevation={0} square={true}>{
            providers? providers.map(provider => {
                if (provider.system) return null // do not list built-in providers

                return <Paper className={classes.providerListItemWrapper} key={provider.id} elevation={2}>
                    <div className={clsx(classes.providerListItem, { [classes.selectedProvider]: provider.id === selected_provider })}>
                        <div style={{ overflow: 'hidden' }}>
                            <Typography variant={'body1'} className={classes.textOverflowEllipsis}>{provider.title}</Typography>
                            <Typography variant={'subtitle1'} className={classes.textOverflowEllipsis}>{provider.id}</Typography>
                        </div>

                        <div style={{ flex: 1 }}/>
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
                            <div>
                                <IconButton size="small" title="Edit provider" onClick={()=> {
                                    const target = provider.id

                                    const found = providers.find(provider=> { 
                                        return provider.id === target 
                                    })

                                    if (found) {
                                        const { streams, meta, collections } = found
                                        
                                        setSelectedProvider(found.id)

                                        setFormData({
                                            id: String(found.id),
                                            title: String(found.title),
                                            url: String(found.url),
                                            streams: streams.join(','),
                                            meta: meta.join(','),
                                            collections: collections.join(',')
                                        })

                                        formRef.current.scrollIntoView()
                                    }
                                }}>
                                    <SettingsIcon/>
                                </IconButton>
                            </div>
                            <form method="DELETE" action="/api/user/provider" onSubmit={submitDeleteProviderForm}>
                                <input name="_csrf" type="hidden" defaultValue={token}/>
                                <input type="text" title="id" name="id" style={{ display: 'none' }} defaultValue={provider.id} hidden={true}/>
                                <IconButton size="small" type="submit" title="Delete provider" component="button">
                                    <DeleteIcon/>
                                </IconButton>
                            </form>
                        </div>
                    </div>
                </Paper>
            }) : null
        }
        </Paper>
    </div>

    <EditProviderForm
        modifyingProvider={selected_provider}
        providers={providers}
        setInput={setProviderFormInput}
        token={token}
        formRef={formRef} 
        formData={formData}
        clearForm={clearProviderForm} 
        onSubmit={submitProviderForm}
        component="button"
        onInputChange={onProviderFormInputChanged}
    />

    {/* TODO Doesn't require login */}
    <div>
        <Typography className={classes.sectionTitle} variant="h4" gutterBottom>Dark theme</Typography>
        <Select
          variant="filled"
          labelId="theme-select-label"
          id="theme-select"
          value={dark_mode}
          className={classes.input}
          onChange={(evt)=> setDarkMode(evt.target.value)}
        >
          <MenuItem value={'light'}>Off</MenuItem>
          <MenuItem value={'dark'}>On</MenuItem>
          <MenuItem value={'auto'}>Auto</MenuItem>
        </Select>
    </div>


    </Container>
}

const hasOwnProperty = Object.prototype.hasOwnProperty



const REGEXP_ID_VALIDATION = new RegExp('(?:^\\w{1,16}$)|(?:^\\*$)')


function EditProviderForm ({ clearForm, modifyingProvider, providers, setInput, token, formData, formRef, onInputChange, onSubmit }) {
    const classes = useSettingsPageStyles()
    const provider_id = formData.id
    const id_pattern = '^\\w{1,16}$'

    // When editing a provider populate default form values
    const defaults = useMemo(function () {
        const defaults = { streams: [], meta: [], collections: [] }

        const provider = providers && providers.find(({ id })=> id === modifyingProvider)

        if (!provider) return defaults
        if (provider.streams) defaults.streams = provider.streams.map((id)=> ({ id }))
        if (provider.meta) defaults.meta = provider.meta.map((id)=> ({ id }))
        if (provider.collections) defaults.collections = provider.collections.map((id)=> ({ id }))

        return defaults
    }, [providers, modifyingProvider])

    // Add wildcard and new provider id as recommendation
    const id_options = useMemo(function () {
        const options = [...providers].sort(function (a, b) { return a.id > b.id ? 1 : -1 })

        // if valid and not a duplicate entry
        if (REGEXP_ID_VALIDATION.test(provider_id) && !options.find(({ id })=> id === provider_id)) 
            options.push({ id: provider_id })

        if (provider_id !== '*') options.push({ id: '*' })
        
        return options
    }, [provider_id, providers])

    return <form className={classes.form} ref={formRef} method="POST" action="/api/user/provider" onSubmit={onSubmit} autoComplete="off" spellCheck="false">
        <input name="_csrf" type="hidden" defaultValue={token}/>
        <Typography className={classes.sectionTitle} variant="h4" gutterBottom>Add / Edit provider</Typography>
        <TextField
            placeholder="Example Provider" 
            helperText="A name used to refer to this provider." 
            variant="filled" 
            className={classes.input} 
            title="Title"
            label="Title"
            name="title"
            InputProps={{ disableUnderline: true }}
            inputProps={{ maxLength: 50, pattern: '^.+' }}
            value={formData.title} 
            onChange={onInputChange}
        />
        <TextField 
            placeholder="example" 
            helperText="A unique identifier. If the identifier is in use the existing provider will be modified." 
            variant="filled" 
            className={classes.input} 
            title="Provider ID" 
            label="Provider ID" 
            name="id" 
            required={true}
            InputProps={{ disableUnderline: true }}
            inputProps={{ maxLength: 16, pattern: id_pattern }}
            value={formData.id} 
            onChange={onInputChange}
        />
        <TextField 
            placeholder="/api/providers/example" 
            helperText="The base URL with /streams, /collection and /meta routes." 
            variant="filled" 
            className={classes.input} 
            title="URL" 
            label="URL" 
            name="url"
            required={true}
            InputProps={{ disableUnderline: true }}
            inputProps={{ maxLength: 500, pattern: '^.+' }}
            value={formData.url} 
            onChange={onInputChange}
        />
        <AutoCompletedInput
            className={classes.input}
            defaultValue={defaults.streams}
            name="streams"
            setInput={setInput}
            options={id_options}
            renderInput={(params) => (
                <TextField {...{
                    variant: 'filled',
                    placeholder: 'example,*',
                    helperText: 'An optional comma seperated list of provider ids to serve streams for. Use * to match all providers.', 
                    title: 'Streams',
                    label: 'Streams',
                    name: 'streams',
                    ...params
                }}/>
            )}
        />
        <AutoCompletedInput
            className={classes.input}
            defaultValue={defaults.meta}
            name="meta"
            setInput={setInput}
            options={id_options}
            renderInput={(params) => (
                <TextField {...{
                    variant: 'filled',
                    placeholder: 'example,*',
                    helperText: 'An optional comma seperated list of provider ids to serve meta for. Use * to match all providers.', 
                    title: 'Meta',
                    label: 'Meta',
                    name: 'meta',
                    ...params
                }}/>
            )}
        />
        <AutoCompletedInput
            className={classes.input}
            defaultValue={defaults.collections}
            name="collections"
            setInput={setInput}
            options={id_options}
            renderInput={(params) => (
                <TextField {...{
                    variant: 'filled',
                    placeholder: 'example,*',
                    helperText: 'An optional comma seperated list of provider ids to serve collections for. Use * to match all providers.', 
                    title: 'Collections',
                    label: 'Collections',
                    name: 'collections',
                    ...params
                }}/>
            )}
        />
        <Button
            title="Clear"
            onClick={clearForm}
            variant="contained"
            size="large"
            className={clsx(classes.input, classes.button)}
            startIcon={<ClearIcon />}
        >Clear</Button>
        <Button
            title="Save"
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            className={clsx(classes.input, classes.button)}
            startIcon={<SaveIcon />}
        >Save</Button>
    </form>
}


/*
IDEA Provide error feedback for the user input
IDEA Enforce maxLength (i.e approx 30 chips at length 16 with , as a seperator)
IDEA Support noscripters (render fallback TextFields until mounted)
// const ids_pattern = '^(?:(?:\\w+(?:,\\w+)?)+|\\*)$'
// inputProps:{ ...params.inputProps, 
//     maxLength: 400, 
//     pattern: ids_pattern 
// }
*/

function AutoCompletedInput ({
    defaultValue,
    name,
    setInput,
    ...autoCompleteProps
}) {
    const [chips, setChips] = useState([])
    const [inputValue, setInputValue] = useState('')

    // Reset form state
    useEffect(function () {
        if (defaultValue) {     
            setChips(defaultValue)
            setInputValue('')
        }
    }, [defaultValue])

    useEffect(function () {
        if (setInput) setInput(name, chips.map((item)=> item.id).join(','))
    }, [chips, name, setInput])

    // Insert user choices
    const pushChip = useCallback(function (item) {
        let id = (item && item.id || '').toLowerCase()

        const matched = id.match(/\*|\w+/)

        if (!id || !matched) return

        id = matched[0]

        if (REGEXP_ID_VALIDATION.test(id)) {
            setChips((previous)=> {
                // Toggle as per default behavior
                const prev_len = previous.length

                // Prevent duplicate entries
                let wild = previous.find((item)=> item.id === '*')
                let state = previous.filter((item)=> item.id !== id)
                
                // Push chip
                if (state.length === prev_len) {
                    // Asterix not valid with other values
                    if (wild) return [wild]
                    if (id === '*') state = []

                    state.push({ ...item, id })
                }

                return state
            })

            setInputValue('')
        }
    }, [])

    return <Autocomplete
        size="small"
        value={chips||[]}
        onChange={(_event, newValue, _reason) => {
            if (_reason === 'select-option') {
                pushChip(newValue[newValue.length - 1])
                return 
            }

            // Insert chip on enter pressed
            else if (_reason === 'create-option') {
                pushChip({ id: newValue[newValue.length - 1] }) // string
                return
            }

            setChips(()=> newValue)
        }}

        // The form input is a controlled component
        inputValue={inputValue}

        // Insert chip on blur event
        onBlur={(evt)=> { pushChip({ id: evt.target.value }) }}

        onInputChange={(_event, newInputValue, _reason) => {
            // Insert chip on seperator
            if (newInputValue.endsWith(',') || newInputValue.endsWith(' ')) 
                pushChip({ id: newInputValue })

            // Update controlled input component
            else if (!newInputValue || newInputValue.match(REGEXP_ID_VALIDATION))
            {
                setInputValue(newInputValue)
            }
        }}

        multiple
        limitTags={5}
        getOptionLabel={(option) => option.id}
        freeSolo
        fullWidth
        renderTags={(chips, getTagProps) => {
            return chips.map(({ id }, index) => (
                <Chip
                    key={id}
                    variant="outlined" 
                    label={id} 
                    {...getTagProps({ index })} 
                />
            ))
        }}
        {...autoCompleteProps}
    />

}
