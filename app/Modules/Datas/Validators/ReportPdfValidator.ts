import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ReportPdfValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    reportName: schema.string([rules.regex(/\.pdf+$/)]),
    dashboardId: schema.number(),
    pdfScale: schema.number.optional(),
    language: schema.string.optional(),
    landscape: schema.boolean.optional(),
    companyName: schema.string.optional(),
    companyPhone: schema.string.optional(),
    companyEmail: schema.string.optional(),
    companyAdress: schema.string.optional(),
    companyWebsite: schema.string.optional(),
  })

  public messages: CustomMessages = {}
}
