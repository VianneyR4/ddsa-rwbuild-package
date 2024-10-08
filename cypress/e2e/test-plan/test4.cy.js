const description =
  'Create a nested set of tasks that includes every task type.' +
  '  Navigate around using the breadcrumb to return to the root task.' +
  '  Check that you can move tasks around.  Join the tasks with arrows (temporal constraints).' +
  '  Remove tasks with upstream and downstream constraints and check that the arrows are removed too.'

describe('Test 4', () => {
  function create_nested_tasks() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Plan"] > text.grabbable')
    cy.get('g[data-path="plan:planA"]').first().dblclick({ multiple: false })
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Action"] > text.grabbable', 0.25, 0.25)
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Enquiry"] > text.grabbable', 0.25, 0.75)
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Decision"] > text.grabbable', 0.75, 0.25)
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Plan"] > text.grabbable', 0.75, 0.75)
  }

  function navigate_around() {
    cy.get('tspan.clickable').contains('plan').click({ force: true })
    cy.get('g[data-path="plan:planA"').first().dblclick({ multiple: false })
    cy.get('text.grabbable:contains("actionB")').click({ force: true })
  }

  function move_task_around() {
    cy.drag_and_drop_svg('g[data-path="plan:planA:decisionD"] > text.grabbable', 0.35, 0.35)
    cy.drag_and_drop_svg('g[data-path="plan:planA:enquiryC"] > text.grabbable', 0.35, 0.65)
    cy.drag_and_drop_svg('g[data-path="plan:planA:actionB"] > text.grabbable', 0.65, 0.35)
    cy.drag_and_drop_svg('g[data-path="plan:planA:planE"] > text.grabbable', 0.65, 0.65)
  }

  function connect_tasks() {
    cy.connect_tasks_svg(
      'g[data-path="plan:planA:enquiryC"]',
      'g[data-path="plan:planA:decisionD"]'
    )
    cy.connect_tasks_svg('g[data-path="plan:planA:decisionD"]', 'g[data-path="plan:planA:planE"]')
    cy.connect_tasks_svg('g[data-path="plan:planA:decisionD"]', 'g[data-path="plan:planA:actionB"]')
  }

  function remove_tasks() {
    cy.get('g[data-path="plan:planA:decisionD"] > text.grabbable').first().click({ force: true })
    cy.click_button_with_content('Delete')
    cy.get('div#delete-task-modal', { timeout: 10000 }).should('be.visible')
    cy.click_button_with_content('OK')
    cy.get('.arrow').should('not.exist')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    create_nested_tasks()
    navigate_around()
    move_task_around()
    connect_tasks()
    remove_tasks()
  })
})
