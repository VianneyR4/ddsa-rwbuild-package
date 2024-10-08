const description =
  'Start a new plan.  Add five data definitions:' +
  ' credit_history (Text - range: {"good"/"bad"}),' +
  ' loan_amount (int),' +
  ' loan_term (int range: {12,36,60}),' +
  ' applicant_income (int),' +
  ' coapplicant_income (int),' +
  ' total_income (integer with a value condition of applicant_income + (is_known("coapplicant_income") ?coapplicant_income : 0)).' +
  // next step
  ' Add an enquiry (named enquire) to source the first five definitions, making all but coapplicant_income required.' +
  '  Add a decision (named decide) with two candidates grant and deny.' +
  // grant
  '  For grant add recommendCondition net_support("grant")>1 and the argumentation:' +
  'loan_amount < 0.40 * total_income * loan_term / 60' +
  'credit_history == "good"'
'credit_history == "bad"' +
  // deny
  'For deny add the recommendCondition net_support("grant") <= 1.' +
  // next step
  'Add two actions, one called "granted" and the other called "denied".' +
  "For the granted action add the preCondition result_of('decide') == 'grant'." +
  "For the denied action add the preCondition result_of('decide') == 'deny'." +
  // Perform
  'An application for a loan of 1000 to be repaid over 12 months by an applicant with an income of 10000 should be denied.' +
  'If you add a coapplicant with an income of 30000 it should be granted.'

describe('Test 7', () => {
  function add_defs() {
    cy.get('button#c-task-tabs-data').click()
    cy.get('input#newcdatadef').type(
      'credit_history{enter}' +
        'loan_amount{enter}' +
        'loan_term{enter}' +
        'applicant_income{enter}' +
        'coapplicant_income{enter}' +
        'total_income{enter}'
    )
    cy.get('tr > td.clickable').contains('credit_history').click()
    cy.get('input#Text').click({ force: true })
    cy.get('button#c-data-tabs-range').click()
    cy.get('input#rangevalue').type('good{enter}bad{enter}')
    cy.click_button_with_content('Plan: plan')
    cy.get('tr > td.clickable').contains('loan_term').click()
    cy.get('button#c-data-tabs-range').click()
    cy.get('input#rangevalue').type('12{enter}36{enter}60{enter}')
    cy.click_button_with_content('Plan: plan')
    cy.get('tr > td.clickable').contains('total_income').click()
    cy.get('button#c-data-tabs-value').click()
    cy.get('input#valueCondition').type(
      'applicant_income + (is_known("coapplicant_income") ? coapplicant_income : 0){enter}'
    )
  }

  function add_enquiry() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Enquiry"] > text.grabbable', 0.25, 0.5)
    cy.get('div#c-task-tabs-details-p')
      .find('input#name')
      .type('{selectAll}{backspace}enquire{enter}')
    cy.get('button#c-task-tabs-source').click()
    cy.click_button_with_content('New Source')
    cy.click_button_with_content('New Source')
    cy.click_button_with_content('New Source')
    cy.click_button_with_content('New Source')
    cy.click_button_with_content('New Source')
    cy.get('tr > td.clickable').contains('credit_history').click()
    cy.get('div').contains('Required').parent().find('input').click({ force: true })
    cy.click_button_with_content('Next >')
    cy.get('div').contains('Required').parent().find('input').click({ force: true })
    cy.click_button_with_content('Next >')
    cy.get('div').contains('Required').parent().find('input').click({ force: true })
    cy.click_button_with_content('Next >')
    cy.get('div').contains('Required').parent().find('input').click({ force: true })
    cy.click_button_with_content('Next >')
    cy.get('div').contains('Required').parent().find('input').click({ force: true })
  }

  function add_decision() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Decision"] > text.grabbable')
    cy.get('div#c-task-tabs-details-p')
      .find('input#name')
      .type('{selectAll}{backspace}decide{enter}')
    cy.click_button_with_content('Candidates')
    cy.get('input#newcandidate').type('grant{enter}')
    cy.get('input#newcandidate').type('deny{enter}')
    cy.get('tr > td.clickable').contains('Grant').click()
    cy.click_button_with_content('Arguments')
    cy.get('input#newargument').type(
      'loan_amount < 0.40 * total_income * loan_term / 60{enter}' +
        'credit_history == "good"{enter}' +
        'credit_history == "bad"{enter}'
    )
    cy.click_button_with_content('Recommend')
    cy.get('input#recommendCondition').type('{selectAll}{backspace}net_support("grant")>1{enter}')
    cy.click_button_with_content('Next >')
    cy.click_button_with_content('Recommend')
    cy.get('input#recommendCondition').type('{selectAll}{backspace}net_support("grant")<=1{enter}')
  }

  function add_actions() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Action"] > text.grabbable', 0.75, 0.25)
    cy.get('div#c-task-tabs-details-p')
      .find('input#name')
      .type('{selectAll}{backspace}granted{enter}')
    cy.click_button_with_content('Constraints')
    cy.get('input#preCondition').type("result_of('decide') == 'grant'{enter}")
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Action"] > text.grabbable', 0.75, 0.75)
    cy.get('div#c-task-tabs-details-p')
      .find('input#name')
      .type('{selectAll}{backspace}denied{enter}')
    cy.click_button_with_content('Constraints')
    cy.get('input#preCondition').type("result_of('decide') == 'deny'{enter}")
  }

  function perform_10k() {
    cy.click_button_with_content('Perform')
    cy.get('input#credit_historygoodtask').click({ force: true })
    cy.get('input#loan_term12task').click({ force: true })
    cy.get('input[name="loan_amounttask"]').type('1000{enter}')
    cy.get('input[name="applicant_incometask"]').type('10000{enter}')
    cy.get('input[name="coapplicant_incometask"]').type('0{enter}')
    cy.click_button_with_content('Next')
    cy.get('input#deny').should('be.checked')
    cy.get('input#grant').should('be.not.checked')
  }

  function perform_30k() {
    cy.click_button_with_content('Restart')
    cy.click_button_with_content('Enquiry A')
    cy.get('input#credit_historygoodtask').click({ force: true })
    cy.get('input#loan_term12task').click({ force: true })
    cy.get('input[name="loan_amounttask"]').type('1000{enter}')
    cy.get('input[name="applicant_incometask"]').type('30000{enter}')
    cy.get('input[name="coapplicant_incometask"]').type('0{enter}')
    cy.click_button_with_content('Next')
    cy.get('input#deny').should('be.not.checked')
    cy.get('input#grant').should('be.checked')
    cy.click_button_with_content('Next')
  }

  function tweakAndPerform_10k() {
    cy.click_button_with_content('Compose')
    cy.get('text').contains('decide').click()
    cy.click_button_with_content('Candidates')
    cy.get('td').contains('Grant').click()
    cy.click_button_with_content('Arguments')
    cy.get('td').contains('credit_history == "good').click()
    cy.get('input[name="supportValue"]').clear()
    cy.get('input[name="supportValue"]').type('2')
    cy.click_button_with_content('Perform')
    cy.get('input#credit_historygoodtask').click({ force: true })
    cy.get('input#loan_term12task').click({ force: true })
    cy.get('input[name="loan_amounttask"]').type('1000{enter}')
    cy.get('input[name="applicant_incometask"]').type('10000{enter}')
    cy.get('input[name="coapplicant_incometask"]').type('0{enter}')
    cy.get('button.btn-info').contains('Next').click()
    cy.get('input#grant').should('be.checked')
    cy.get('input#deny').should('be.not.checked')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    add_defs()
    add_enquiry()
    add_decision()
    add_actions()
    perform_10k()
    perform_30k()
    tweakAndPerform_10k()
  })
})
