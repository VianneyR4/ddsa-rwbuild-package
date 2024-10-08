const description =
  'Add an integer data definition: ok, "Are you ok?" with an annotated range of 1 - "Yes" and 0 - "No".' +
  ' Add a text data definition: fruit, "What fruit do you like" with a range of fruit of your choice.' +
  ' remove fruit. edit fruit. Check that your changes are reflected in the code. Edit some of the fruit in the code.' +
  ' Check that those changes are reflected in the editor. Delete fruit items in code and editor. Delete one of the data definitions.'

describe('Test 2', () => {
  function add_annotated_data_in_range_tab(value, caption) {
    cy.get('input#rangevalue').type(value)
    cy.get('input#rangecaption').type(caption)
    cy.get('button').contains('+').click()
  }

  function add_raw_data_in_range_tab(value) {
    cy.get('input#rangevalue').type(value + '{enter}')
  }

  function add_integer_definition() {
    cy.get('button#c-task-tabs-data').click()
    cy.get('input#newcdatadef').type('ok{enter}')
    cy.get('tr > td.clickable').contains('ok').click()
    cy.get('div#c-data-tabs-details-p')
      .find('input#caption')
      .type('{selectAll}{backspace}Are you ok?')
    cy.get('button#c-data-tabs-range').click()
    cy.get('input#Annotated').click({ force: true })
    add_annotated_data_in_range_tab('1', 'Yes')
    add_annotated_data_in_range_tab('0', 'No')
    cy.click_button_with_content('Plan')
  }

  function add_string_definition() {
    cy.get('button#c-task-tabs-data').click()
    cy.get('input#newcdatadef').type('fruit{enter}')
    cy.get('tr > td.clickable').contains('fruit').click()
    cy.get('div#c-data-tabs-details-p')
      .find('input#caption')
      .type('{selectAll}{backspace}What fruit do you like')
    cy.get('input#Text').click({ force: true })
    cy.get('button#c-data-tabs-range').click()
    add_raw_data_in_range_tab('apple')
    add_raw_data_in_range_tab('grape')
    add_raw_data_in_range_tab('banana')
  }

  function delete_fruit() {
    cy.get('td').contains('apple').parent().find('button').click()
  }

  function edit_fruit() {
    cy.get('td.clickable').contains('grape').click()
    cy.get('input#editrangevalue').type('{selectAll}{backspace}kiwi{enter}')
  }

  function check_changes_in_code_view() {
    cy.click_button_with_content('Code')
    cy.ace_find('"name": "ok"').prev().contains('"caption": "Are you ok?"')
    cy.ace_find('"name": "ok",')
      .ace_next_line()
      .ace_next_line()
      .ace_next_line()
      .contains('div.ace_line', '"value": 1')
      .ace_next_line()
      .contains('div.ace_line', '"caption": "Yes"')
      .ace_next_line()
      .ace_next_line()
      .ace_next_line()
      .contains('div.ace_line', '"value": 0')
      .ace_next_line()
      .contains('div.ace_line', '"caption": "No"')
    cy.ace_find('"name": "fruit"').prev().contains('"caption": "What fruit do you like"')
    cy.ace_find('"name": "fruit"')
      .ace_next_line()
      .ace_next_line()
      .contains('div.ace_line', '"kiwi"')
      .ace_next_line()
      .contains('div.ace_line', '"banana"')
    cy.ace_find('"apple"').should('not.exist')
  }

  function edit_fruit_in_code_view() {
    cy.ace_find_and_replace('"banana"', '"lemon",').ace_add_next_line('"pear"')
    cy.click_button_with_content('Editor')
  }

  function check_changes_in_editor() {
    cy.get('td').contains('kiwi')
    cy.get('td').contains('lemon')
    cy.get('td').contains('pear')
    cy.get('td').contains('banana').should('not.exist')
  }

  function delete_fruit_items_in_editor() {
    cy.get('td').contains('pear').parent().find('button').click({ force: true })
    cy.click_button_with_content('Code')
  }

  function delete_fruit_items_in_code_view() {
    cy.ace_find_and_delete('"lemon"')
    cy.click_button_with_content('Editor')
    cy.click_button_with_content('Plan')
  }

  function delete_data_def() {
    cy.get('tr > td.clickable').contains('ok').parent().find('button', { timeout: 10000 }).click()
  }

  function check_editor_data() {
    cy.get('tr > td.clickable').contains('ok').should('not.exist')
    cy.get('tr > td.clickable').contains('fruit').click()
    cy.click_button_with_content('Range')
    cy.get('span').contains('kiwi')
    cy.get('span').contains('lemon').should('not.exist')
    cy.get('span').contains('pear').should('not.exist')
    cy.click_button_with_content('Code')
    cy.click_button_with_content('Editor')
    cy.click_button_with_content('Code')
  }

  function check_code_view_data() {
    cy.ace_find('"name": "ok"').should('not.exist')
    cy.ace_find('"name": "fruit"')
      .ace_next_line()
      .ace_next_line()
      .contains('div.ace_line', '"kiwi"')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    add_integer_definition()
    add_string_definition()
    delete_fruit()
    edit_fruit()
    check_changes_in_code_view()
    edit_fruit_in_code_view()
    check_changes_in_editor()
    delete_fruit_items_in_editor()
    delete_fruit_items_in_code_view()
    delete_data_def()
    check_editor_data()
    check_code_view_data()
  })
})
