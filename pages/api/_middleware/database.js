import mongoose from 'mongoose'

let client

initializeDbModels()

export default async function database (req, res, next) {
	if (!client) {
		client = mongoose.connect(process.env.DB_URL, { 
			useNewUrlParser: true,
			useUnifiedTopology: true, 
			useFindAndModify: false
		})
	}
	
	try {
		await client
		req.db = mongoose.connection.db
		req.dbClient = mongoose.connection
		next()
	} catch(e) {
		next(e)
	}
}




// FIXME

function initializeDbModels () {
	if (!mongoose.models.providers) {
		const providerId = (required, wildcard) => { 
			const reg = wildcard? /^(?:(?:\w+\b)|\*)$/ : /^\w+\b$/
		
			return {
				type: String,
				required: !!required,
				maxLength: 16, 
				minLength: 1,
				validate: {
					validator: v => reg.test(v),
					message: props => `${props.value} is not a valid provider id!`
				},
			}
		}

		const providerIdCap =(val)=> {
			return Array.isArray(val) && val.length <= 25
		}
		
		const arrayOfProviderId =()=> { 
			return {
				type: [providerId(false, true)],
				validate: [providerIdCap, '{PATH} exceeds the limit of allowed providers']
			}
		}

		const providerSchema = new mongoose.Schema({
			user: { type: String, required: true },
			url: { type: String, required: true, maxLength: 500 },
			id: providerId(true),
			title: { type: String, maxLength: 50 },
			meta: arrayOfProviderId(), 
			streams: arrayOfProviderId(),
			collections: arrayOfProviderId()
		})

		providerSchema.index({ user: 1, id: 1 }, { unique: true })

		mongoose.model('providers', providerSchema)
	}

	if (!mongoose.models.playlistitems) 
	mongoose.model('playlistitems', new mongoose.Schema({
		playlist: {  type: String, required: true, maxlength: 500 },

		user: { type: String, required: true, maxlength: 500 },

		date: { type: Date },

		id: { type: String, required: true, maxlength: 500 },

		tmdb_id: { type: String, maxlength: 100 },

		type: {
			type: String, 
			required: true,
			validate: [
				function (v) {
					return v === 'movie' || v === 'series'
				},
				'Invalid item type'
			]
		},

		title: { type: String, required: true, maxlength: 500 },

		poster: { type: String, maxlength: 1000 },

		year: {
			type: Number, 
			validate: [
				function (v) { 
					return /^[0-9]{4,5}$/.test(v) 
				},
				'Invalid year'
			]
		}
	}))
}



// import { MongoClient } from 'mongodb'
// import { parse as parseURL } from 'url'
// const DB_NAME = parseURL(process.env.DB_URL).pathname.substr(1)

// const client = new MongoClient(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

// export default async function database (req, res, next) {
//   if (!client.isConnected()) await client.connect()

//   req.dbClient = client
//   req.db = client.db(DB_NAME)

//   next()
// }