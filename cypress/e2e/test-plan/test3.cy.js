const description =
  'Create a new plan.  Add a new dob date data definition.' +
  "  Also add a new age integer data definition with a valueCondtion of is_known('dob') ? now().diff(dob, 'years') : undefined." +
  '  Add an enquiry that collects dob and then an action has "${age} years old" as its description.' +
  '  When you review the pathway and enter a date you should see the correct current age shown on the next task.'

describe('Test 3', () => {
  function add_dob_data_def() {
    cy.get('button#c-task-tabs-data').click()
    cy.get('input#newcdatadef').type('dob{enter}')
    cy.get('tr > td.clickable').contains('dob').click()
    cy.get('input#Date').click({ force: true })
    cy.click_button_with_content('Plan')
  }

  function add_age_data_def() {
    cy.get('input#newcdatadef').type('age{enter}')
    cy.get('tr > td.clickable').contains('age').click()
    cy.get('button#c-data-tabs-value').click()
    cy.get('input#valueCondition').type(
      "is_known('dob') ? now().diff(dob, 'years') : undefined{enter}"
    )
  }

  function add_enquiry() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Enquiry"] > text.grabbable', 0.25, 0.25)
    cy.get('div#c-task-tabs-details-p').find('textarea#description').type('${{}age} years old')
    cy.get('button#c-task-tabs-source').click()
    cy.get('select').select('dob')
    cy.click_button_with_content('New Source')
    cy.click_button_with_content('Perform')
  }

  function review() {
    const date = new Date()
    const day = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString()
    const month =
      date.getMonth() < 9
        ? '0' + (date.getMonth() + 1).toString()
        : (date.getMonth() + 1).toString()
    const dateString = day + '/' + month + '/' + (date.getFullYear() - 26).toString()
    cy.get('input[name="dobtask"]').type(dateString + '{enter}')
    cy.get('button').contains('Enquiry A').click({ force: true })
  }

  function check_age_correct() {
    cy.get('div').contains('26 years old')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    add_dob_data_def()
    add_age_data_def()
    add_enquiry()
    review()
    check_age_correct()
  })
})
