import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public refs = schema.refs({
    id: this.ctx.params.id,
  })
  public schema = schema.create({
    appTitle:schema.string.optional({ trim: true }),
    appSubTitle1:schema.string.optional({ trim: true }),
    appSubTitle2:schema.string.optional({ trim: true }),
    appSubTitle3:schema.string.optional({ trim: true }),
    appIcon:schema.file.optional({
      size: '5mb',
      extnames: ['jpg', 'png','svg'],
    }),
    appLoginBackground:schema.file.optional({
      size: '5mb',
      extnames: ['jpg', 'png','svg'],
    }),
    appCompanyName:schema.string.optional({ trim: true }),
    appCompanyAdress:schema.string.optional({ trim: true }),
    appCompanyWebsite:schema.string.optional({ trim: true }),
    appCompanyEmail:schema.string.optional({ trim: true },[
      rules.email(),
    ]),
    appCompanyPhoneNumber:schema.string.optional({ trim: true },[
      rules.mobile(),
    ]),
    appDefaultLanguage:schema.string.optional({ trim: true },[
      rules.maxLength(2)
    ]),
    appMenuBgBodyColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appMenuBgOverBodyColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appMenuBgCurrentBodyColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appMenuFontBodyColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appMenuFontOverBodyColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appMenuBgHeaderColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appMenuFontHeaderColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appPrimaryColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appPrimaryOverColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),
    appPrimaryFocusRingColor:schema.string.optional({},[
      rules.maxLength(7)
    ]),

  })
  public messages = {}
}
