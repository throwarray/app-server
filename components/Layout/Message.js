export default function Message ({ children, ...props }) {
    const messageStyles = {
        height: '100%',
        width: '100%',
        color: '#fff',
        fontFamily: 'Tahoma',
        fontSize: '18px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

    }

    return <div {...props} style={{...messageStyles, ...props.style }}>
        { children }
    </div>
}
