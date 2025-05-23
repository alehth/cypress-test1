describe('Test with backend', () => {

  beforeEach('login to application',()=>{
    cy.intercept('GET','https://conduit-api.bondaracademy.com/api/tags',{fixture:'tags.json'})
    cy.loginToApplication()
  })
  it('Verify correct request and response', () => {
    cy.intercept('POST','https://conduit-api.bondaracademy.com/api/articles').as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('This is the title4')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('[formcontrolname="body"]').type('This is the body of the article')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then(xhr=>{
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal('This is the body of the article')
      expect(xhr.response.body.article.description).to.equal('This is a description')
    })

  })

  it('Verify popular tags are displayed', () => {
    cy.get('.tag-list')
    .should('contain','Cypress')
    .and('contain','Automation')
    .and('contain','Testing')
  });

  it.only('Verify global feed likes count', () => {
    cy.intercept('GET','https://conduit-api.bondaracademy.com/api/articles/feed*',{"articles":[],"articlesCount":0})
    cy.intercept('GET','https://conduit-api.bondaracademy.com/api/articles*',{fixture:'articles.json'})

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then(heartList =>{
      expect(heartList[0]).to.contain('1')
      expect(heartList[1]).to.contain('5')
    })

    cy.fixture('articles').then(file=>{
      const articleLink = file.articles[1].slug 
      file.articles[1].favoritesCount = 6
      cy.intercept('POST','https://conduit-api.bondaracademy.com/api/articles/'+articleLink+'/favorite',file)
    })

    cy.get('app-article-list button').eq(1).click().should('contain','6')
  });


})