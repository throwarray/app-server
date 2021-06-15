import mongoose from 'mongoose'

// Store the pending db connection as a global to handle hmr
// https://github.com/ashconnell/next.js/commit/45fbe64829a0a6b781837b0c7613f73308ba088c

let cached = global.mongo

export default async function databaseMiddleware (req, _res, next) {
	try {
		if (!cached) {
			// connection = mongoose.createConnection(process.env.DB_URL)
			// connection.model('ModelName', modelSchema)

			cached = global.mongo = mongoose.connect(process.env.DB_URL, { 
				useNewUrlParser: true,
				useUnifiedTopology: true, 
				useFindAndModify: false
			}).then(m => m.connection.getClient())
			
			initializeDbModels(mongoose.connection)
		}

		await cached

		req.db = mongoose.connection.db
		req.dbClient = mongoose.connection
		req.clientPromise = cached

		next()
	} catch(e) {
		next(e)
	}
}

// TODO Would prefer not to use mongoose.
// Do validation manually with joi, ajv... 
// Ensure the compound index is kept.

function initializeDbModels (/*connection*/) {
	if (!mongoose.models.providers) {
		const providerId = (required, wildcard) => { 
			const reg = wildcard? /^(?:\w{0,16}|\*)$/ : /^\w{0,16}$/
		
			return {
				type: String,
				required: !!required,
				maxLength: 16, 
				minLength: 0,
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