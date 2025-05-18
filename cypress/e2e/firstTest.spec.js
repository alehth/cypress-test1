describe('Test with backend', () => {

  beforeEach('login to application',()=>{
    cy.intercept({method:'Get',path:'tags'},{fixture:'tags.json'})
    cy.loginToApplication()
  })
  it('Verify correct request and response', () => {
    cy.intercept('POST', Cypress.env('apiUrl')+'/api/articles').as('postArticles')

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

  it('Intercepting an dmodifing the request and response', () => {
    // cy.intercept('POST','**/articles', (req)=>{
    //   req.body.article.description = "This is a NEW description 2"
    // }).as('postArticles')

    cy.intercept('POST','**/articles', (req)=>{
      req.reply(res=>{
        expect(res.body.article.description).to.equal('This is a description')
        res.body.article.description =  'This is a NEW description'
      })
    }).as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('This is the title6')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('[formcontrolname="body"]').type('This is the body of the article')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then(xhr=>{
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal('This is the body of the article')
      expect(xhr.response.body.article.description).to.equal('This is a NEW description')
    })

  })

  it('should gave tags with routing object', () => {
    cy.get('.tag-list')
    .should('contain','Cypress')
    .and('contain','Automation')
    .and('contain','Testing')
  });

  it('Verify global feed likes count', () => {
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

  it('Prueba para crear nuevo artículo y borrarlo', () => {
    cy.contains('New Article').click()
    const randomNum = Math.floor(Math.random() * 1000);
    const textoConNumero = `Título ejemplo - ${randomNum}`;
    cy.get('[formcontrolname="title"]').type(textoConNumero)
    cy.get('[formcontrolname="description"]').type('Descripción de prueba')
    cy.get('[formcontrolname="body"]').type('Cuerpo de artículo de prueba')
    cy.get('[type="button"]').click()
    cy.wait(3000)
    cy.contains('Home').click()
    cy.contains(textoConNumero).click()
    cy.contains('Delete Article').click()
  });

  it('Delete a new article in a global feed 2', () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const titleFull = "Test with Postman API "+randomNum
    const bodyRequest = {
      "article": {
          "title": titleFull,
          "description": "Api testing description",
          "body": "Body API Test",
          "tagList": []
      }
    }

    cy.get('@token').then(token=>{
      cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles/',
        headers: {'Authorization':'Token '+token},
        method: 'POST',
        body: bodyRequest
      }).then(response=>{
        expect(response.status).to.equal(201)
      })

      cy.contains('Global Feed').click()
      cy.wait(3000)
      cy.get('.article-preview').first().click()
      cy.get('.article-actions').contains(' Delete Article ').click()

      cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
        headers: {'Authorization':'Token '+token},
        method: 'GET'
      }).its('body').then(body=>{
        expect(body.articles[0].title).not.to.equal(titleFull)
      })
    })
  });

})