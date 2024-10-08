const description =
  'Start with a new plan.  add a new enquiry and plan. double click on plan and add a decision.' +
  '  click on the root plan in the breadcrumb.  You should see two issues (missing sources and candidates).' +
  '  If you click on the decision path it should be selected and the parent plan changed in the map.'

describe('Test 5', () => {
  function create_nested_tasks() {
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Plan"] > text.grabbable', 0.75, 0.5)
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Enquiry"] > text.grabbable', 0.25, 0.5)
    cy.get('g[data-path="plan:planA"]').first().dblclick({ multiple: false })
    cy.drag_and_drop_svg('g#taskbar > g[data-clazz="Decision"] > text.grabbable')
  }

  function see_issue_on_root_plan() {
    cy.get('tspan.clickable').contains('plan').click({ force: true })
    cy.get('li.text-info').contains('enquiryB: no sources defined')
    cy.get('li.text-info').contains('planA:decisionC: no candidates defined')
  }

  function click_and_see_path_change() {
    cy.get('span.clickable').contains('planA:decisionC').click({ force: true })
    cy.get('svg').find('text').contains('plan : planA').should('exist')
  }

  it(description, () => {
    cy.intercept('/*').as('init')
    cy.visit('/')
    cy.wait('@init')
    cy.reset_plan()
    create_nested_tasks()
    see_issue_on_root_plan()
    click_and_see_path_change()
  })
})
