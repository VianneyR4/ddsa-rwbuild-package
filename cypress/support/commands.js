// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const find_ace = ($ele, find, fn = undefined) => {
  let comp = $ele.find("div.ace_line:contains('" + find + "')")
  if (!comp.hasClass('ace_line')) {
    comp = comp.parent()
  }
  let line = comp.length > 0
  if (line) {
    if (fn != undefined) {
      fn(comp)
    }
    return cy.wrap(comp)
  } else {
    let last = ''
    cy.get('div.ace_gutter-cell')
      .last()
      .then((val) => {
        last = val.text()
      })
    cy.get('div.ace_line').last().click({ force: true })
    cy.get('.ace_text-input').first().focus().type('{downArrow}')
    cy.get('div.ace_gutter-cell')
      .last()
      .then((val) => {
        if (last === val.text()) {
          if (fn != undefined) {
            fn(comp)
          }
          line = true
        }
      })
      .then(() => {
        return line ? cy.wrap(comp) : find_ace($ele, find, fn)
      })
  }
}

Cypress.Commands.add('ace_find', (find) => {
  cy.get('div.ace_editor').then(($ele) => find_ace($ele, find))
})

Cypress.Commands.add('ace_find_and_replace', (find, replace) => {
  cy.get('div.ace_editor').then(($ele) =>
    find_ace($ele, find, (comp) =>
      cy
        .wrap(comp)
        .click({ force: true })
        .then(($ele) => {
          let comma = $ele.find('.ace_punctuation').text() === ','
          cy.get('.ace_text-input')
            .first()
            .focus()
            .type((comma ? '{leftArrow}' : '') + '{backspace}'.repeat(find.length) + replace, {
              force: true
            })
        })
    )
  )
})

Cypress.Commands.add('ace_find_and_delete', (find) => {
  cy.get('div.ace_editor').then(($ele) =>
    find_ace($ele, find, (comp) =>
      cy
        .wrap(comp)
        .click({ force: true })
        .then(($ele) => {
          let comma = $ele.find('.ace_punctuation').text() === ','
          let prvComma = $ele.prev().find('.ace_punctuation').text() === ','
          cy.get('.ace_text-input')
            .first()
            .focus()
            .type(
              (comma ? '{leftArrow}' : '') +
                '{backspace}'.repeat(find.length) +
                (comma ? '{del}{del}' : ''),
              { force: true }
            )
          if (prvComma) {
            cy.wrap($ele.prev()).click({ force: true })
            cy.get('.ace_text-input').first().focus().type('{backspace}')
          }
        })
    )
  )
})

Cypress.Commands.add(
  'ace_next_line',
  {
    prevSubject: true
  },
  (subject) => {
    cy.wrap(subject).click({ force: true })
    cy.get('.ace_text-input').first().focus().type('{downArrow}')
    cy.wrap(subject.next())
  }
)

Cypress.Commands.add(
  'ace_add_next_line',
  {
    prevSubject: true
  },
  (subject, add) => {
    cy.wrap(subject).click({ force: true })
    let prvComma = subject.prev().find('.ace_punctuation').text() === ','
    const nextParen = subject.next().find('.ace_rparen').text()
    let end = nextParen.includes('}') || nextParen.includes(']')
    cy.get('.ace_text-input')
      .first()
      .focus()
      .type((prvComma ? '' : ',') + '{enter}' + add + (end ? '' : ','))
    cy.wrap(subject.next())
  }
)

Cypress.Commands.add('click_button_with_content', (content) => {
  cy.get('button').contains(content, { matchCase: true }).click()
})

Cypress.Commands.add('reset_plan', () => {
  cy.get('a.dropdown-toggle').click()
  cy.contains('li', 'Plan').click()
})

Cypress.Commands.add('drag_and_drop_svg', (JQuery, x_ratio = 0.5, y_ratio = 0.5) => {
  let mapRect
  cy.get('svg').then(($svg) => {
    mapRect = new DOMRect($svg.position().left, $svg.position().top, $svg.width(), $svg.height())
    cy.get(JQuery)
      .trigger('mousedown', { which: 1, force: true })
      .trigger('mousemove', {
        clientX: mapRect.x + x_ratio * mapRect.width,
        clientY: mapRect.y + y_ratio * mapRect.height,
        force: true
      })
      .trigger('mouseup', { force: true })
  })
})

Cypress.Commands.add('connect_tasks_svg', (from, to) => {
  cy.get('svg')
    .find(from)
    .first()
    .children()
    .first()
    .trigger('mousedown', 'center', { which: 1, force: true })
  cy.get('svg')
    .find(to)
    .first()
    .children()
    .first()
    .trigger('mousemove', 'center', { force: true })
    .trigger('mouseup', { force: true })
})
