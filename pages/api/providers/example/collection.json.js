import { namespace, notFound } from './_utils'

export default async function (req, res) {
    const query = req.query

    const id = query.id

    if (id === namespace) res.json({
        id,
        page: 1,
        items: [
            {
                id: namespace + '-bbb',
                type: 'movie',
                title: 'Big Buck Bunny',
                background: 'blue',
                poster: '/poster_bbb.jpg'
            }
        ]
    })
    
    else notFound(req, res)
}