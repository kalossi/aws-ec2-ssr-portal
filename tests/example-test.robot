*** Settings ***
Library           Browser

***Variables***
${HEADLESS}   true

*** Test Cases ***
Open Example Page
    # Open browser in headless mode
    New Browser    headless=${HEADLESS}
    New Page       https://example.com
    # Check title
    ${title}=      Get Title
    Should Be Equal    ${title}    Example Domain
    Close Browser
