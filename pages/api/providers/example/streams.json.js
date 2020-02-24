import { namespace, notFound } from './_utils'

export default async function (req, res) {
    const query = req.query

    const id = query.id

    if (id === namespace + '-bbb') res.json([
        { 
            url: '/mov_bbb.mp4', 
            type: 'mp4' 
        }
    ])
    
    else notFound(req, res)
}