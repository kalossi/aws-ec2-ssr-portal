*** Settings ***
Library           Browser

*** Variables ***
${HEADLESS}       true
${BASE}           http://ssr_next_app:3000

*** Test Cases ***
Open Example Page
    New Browser    browser=chromium    headless=${HEADLESS}
    New Context    ignoreHTTPSErrors=True
    New Page       https://example.com
    ${title}=      Get Title
    Should Be Equal    ${title}    Example Domain
    Close Browser

*** Test Cases ***
Simple Resources Smoke
    New Browser    browser=chromium    headless=${HEADLESS}
    New Context    ignoreHTTPSErrors=True
    New Page    url=${BASE}/resources
    Wait For Elements State    css=body    visible    timeout=20s
    ${src}=    Get Page Source
    ${has_table}=    Run Keyword And Return Status    Should Contain    ${src}    Instance ID
    Run Keyword If    ${has_table}    Log    Table present    ELSE    Should Contain    ${src}    No instances
    Take Screenshot
    Close Browser