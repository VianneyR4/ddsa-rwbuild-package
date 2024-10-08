const description =
  'Create new plan. Use the editor to edit plan attributes (name, caption, description, autonomous, cyclic).' +
  ' Check that edited attributes can be seen in the code view. Edit attributes in the code view.' +
  ' Check that the new edits can be seen in the editor view.'

describe('Test 1', () => {
  function edit_plan_attributes_in_editor() {
    cy.get('input#name').type('{selectAll}{backspace}TName')
    cy.get('input#caption').type('{selectAll}{backspace}TCaption')
    cy.get('textarea#description').type('{selectAll}{backspace}TDescription')
    cy.get('input#autonomous').click()
    cy.get('input#cyclic').click()
  }

  function check_attribute_seen_in_code_view() {
    cy.get('button#c-tabs-code').click()
    cy.ace_find('"caption": "TCaption"')
      .ace_next_line()
      .contains('"description": "TDescription"')
      .ace_next_line()
      .contains('"name": "TName"')
      .ace_next_line()
      .contains('"cyclic": true')
  }

  function edit_plan_attributes_in_code_view() {
    cy.ace_find_and_replace('"name": "TName"', '"name": "TNICV"')
    cy.ace_find_and_replace('"caption": "TCaption"', '"caption": "TCICV"')
    cy.ace_find_and_replace('"description": "TDescription"', '"description": "TDICV"')
    cy.ace_find_and_replace('"cyclic": true', '"autonomous": true')
  }

  function check_attribute_seen_in_editor() {
    cy.get('button#c-tabs-editor').click()
    cy.get('input#name').invoke('val').should('eq', 'TNICV')
    cy.get('input#caption').invoke('val').should('eq', 'TCICV')
    cy.get('textarea#description').invoke('val').should('eq', 'TDICV')
    cy.get('input#autonomous').should('be.checked')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    edit_plan_attributes_in_editor()
    check_attribute_seen_in_code_view()
    edit_plan_attributes_in_code_view()
    check_attribute_seen_in_editor()
  })
})
