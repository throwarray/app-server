export const namespace = 'example'

export function notFound (req, res) {
    res.status(404)
    res.end('')
}
