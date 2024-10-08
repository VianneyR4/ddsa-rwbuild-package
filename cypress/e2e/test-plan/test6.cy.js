const description =
  'Start with a new plan.  Add a new age data definition with the caption "What is your age?".' +
  '  Add an enquiry that sources that data definition and make it required.  Then add a new decision and join the enquiry and the decision.' +
  '  Add a yes and a no candidate for that decision.  Set the recommendation condition for yes to be "age>=18" and for no to be "age<18".' +
  ' Make the decision automatic.  Then drop an action on the canvas and connect the decision to the action.' +
  "  Set the description to be 'You ${result_of('decisionB') == 'yes' ? 'can' : 'cannot'} vote'." +
  ' When run with an age of 17 the action should say you cannot vote and when run with an age of 18 the action should say you can vote.'

describe('Test 6', () => {
  function add_age_def() {
    cy.get('button#c-task-tabs-data').click()
    cy.get('input#newcdatadef').type('age{enter}')
    cy.get('tr > td.clickable').contains('age').click()
    cy.get('div#c-data-tabs-details-p')
      .find('input#caption')
      .type('{selectAll}{backspace}What is your age?')
  }

  function create_tasks_and_join() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Enquiry"] > text.grabbable', 0.25, 0.5)
    cy.get('button#c-task-tabs-source').click()
    cy.get('select').select('age')
    cy.click_button_with_content('New Source')
    cy.get('tr > td.clickable').contains('age').click()
    cy.get('div').contains('Required').parent().find('input').click({ force: true })
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Decision"] > text.grabbable')
    cy.connect_tasks_svg('g[data-path="plan:enquiryA"]', 'g[data-path="plan:decisionB"]')
  }

  function edit_decision() {
    cy.click_button_with_content('Candidates')
    cy.get('input#newcandidate').type('yes{enter}')
    cy.get('input#newcandidate').type('no{enter}')
    cy.get('tr > td.clickable').contains('Yes').click()
    cy.click_button_with_content('Recommend')
    cy.get('input#recommendCondition').type('{selectAll}{backspace}age>=18{enter}')
    cy.click_button_with_content('Next >')
    cy.click_button_with_content('Recommend')
    cy.get('input#recommendCondition').type('{selectAll}{backspace}age<18{enter}')
    cy.click_button_with_content('Decision: decisionB')
    cy.click_button_with_content('Details')
    cy.get('input#autonomous').should('be.visible')
    cy.get('input#autonomous').click({ force: true })
  }

  function set_action() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Action"] > text.grabbable', 0.75, 0.5)
    cy.connect_tasks_svg('g[data-path="plan:decisionB"]', 'g[data-path="plan:actionC"]')
    cy.get('div#c-task-tabs-details-p')
      .find('textarea#description')
      .type("{selectAll}{backspace}${{}result_of('decisionB') == 'yes' ? 'can' : 'cannot'}")
  }

  function run_protocol() {
    cy.click_button_with_content('Perform')
    cy.get('input[name="agetask"]').type('17{enter}')
    cy.click_button_with_content('Next')
    cy.get('div').contains('cannot').should('exist')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    add_age_def()
    create_tasks_and_join()
    edit_decision()
    set_action()
    run_protocol()
  })
})
