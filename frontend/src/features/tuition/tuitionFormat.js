const money = new Intl.NumberFormat('en-BD', {
  style: 'currency', currency: 'BDT', currencyDisplay: 'code', minimumFractionDigits: 0, maximumFractionDigits: 2,
})
const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export function formatTuitionAmount(amount) {
  return money.format(amount / 100)
}

export function formatBillingMonth(month) {
  return monthLabel.format(new Date(month + '-01T00:00:00Z'))
}
