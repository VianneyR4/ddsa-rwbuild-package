const description =
  'Create a new plan. add a new action.' +
  " make it cyclic with a cycleUntil of 'index('plan:actionA')==2' and a caption of 'Task A ${index('plan:actionA')}." +
  '  Review an enactment.  In the history you should see "Task A 0", "Task A 1" and "Task A 2"'

describe('Test 9', () => {
  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Action"] > text.grabbable')
    cy.get('input#cyclic', { timeout: 10000 }).check()
    cy.get('input#caption').type("{selectAll}{del}Task A ${{}index('plan:actionA')}.")
    cy.click_button_with_content('Constraints')
    cy.get('input#cycleUntil').type("index('plan:actionA')==2{enter}")
    cy.click_button_with_content('Perform')
    cy.get('span').contains('Task A 0.')
    cy.click_button_with_content('Next')
    cy.get('span').contains('Task A 1.')
    cy.click_button_with_content('Next')
    cy.get('span').contains('Task A 2.')
  })
})
