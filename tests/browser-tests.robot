*** Settings ***
Library           Browser

*** Keywords ***
Open App Browser
    Create Browser    chromium    ignore_https_errors=True    headless=True
    New Page    ${BASE}

*** Variables ***
${HEADLESS}       true
${BASE}           http://localhost:3000

*** Test Cases ***
Open Example Page
    New Browser    headless=${HEADLESS}
    New Page       https://example.com
    ${title}=      Get Title
    Should Be Equal    ${title}    Example Domain
    Close Browser

Simple Resources Smoke
    [Documentation]    Basic smoke: page loads and either shows table headers or "No instances"
    New Browser       headless=${HEADLESS}
    New Page          ${BASE}/resources
    Wait For Elements State    css=body    visible    timeout=20s
    ${src}=           Get Page Source
    ${has_table}=     Run Keyword And Return Status    Should Contain    ${src}    Instance ID
    Run Keyword If    ${has_table}    Log    Table present    ELSE    Should Contain    ${src}    No instances
    Take Screenshot
    Close Browser