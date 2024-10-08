const description =
  'Cut and paste a new protocol (e.g. one from proformajs) into the code view.' +
  '  Check that new protocol is visible in the editor and that the root plan is selected.'

describe('Test 8', () => {
  function cut_and_paste_protocol() {
    cy.fixture('test8.json').then((json) => {
      cy.click_button_with_content('Code')
      cy.get('.ace_text-input').focus()
      cy.get('.ace_text-input').type('{ctrl+a}{del}')
      cy.get('.ace_text-input').invoke('val', JSON.stringify(json))
      cy.get('.ace_text-input').type('{enter}')
      cy.click_button_with_content('Editor')
      cy.get('svg')
        .first()
        .children('g.task')
        .should('have.length', json.tasks ? json.tasks.length : 0)
      if (json.name) {
        cy.get('input#name').should('have.value', json.name)
      }
      if (json.description) {
        cy.get('textarea#description').should('have.value', json.description)
      }
      if (json.caption) {
        cy.get('input#caption').should('have.value', json.caption)
      }
      if (json.autonomous) {
        cy.get('input#autonomous').should('be.checked')
      } else {
        cy.get('input#autonomous').should('be.not.checked')
      }
      if (json.cyclic) {
        cy.get('input#cyclic').should('be.checked')
      } else {
        cy.get('input#cyclic').should('be.not.checked')
      }
      cy.get('svg').first().find('tspan.selected').contains(json.name)
    })
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    cut_and_paste_protocol()
  })
})
