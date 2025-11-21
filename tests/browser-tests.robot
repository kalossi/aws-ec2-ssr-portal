*** Settings ***
Library           Browser

***Variables***
${HEADLESS}   true
${BASE}        http://localhost:3000

*** Test Cases ***
Open Example Page
    # Open browser in headless mode
    New Browser    headless=${HEADLESS}
    New Page       https://example.com
    # Check title
    ${title}=      Get Title
    Should Be Equal    ${title}    Example Domain
    Close Browser

App Smoke — Resources Page Loads
    New Browser    headless=${HEADLESS}
    New Page       ${BASE}/resources
    Wait For Elements State    css=body    visible    timeout=13s
    ${title}=      Get Title
    Should Not Be Empty    ${title}
    Capture Page Screenshot
    Close Browser

Resources Table Structure
    New Browser    headless=${HEADLESS}
    New Page       ${BASE}/resources
    Wait For Elements State    css=table, css=.no-instances    visible    timeout=8s
    ${has_table}=    Run Keyword And Return Status    Element Should Be Visible    css=table
    Run Keyword If    ${has_table}    Check Table Headers And Rows    ELSE    Log    "No table present — page shows no instances or different markup"    WARN
    Capture Page Screenshot
    Close Browser

*** Keywords ***
Check Table Headers And Rows
    Element Text Should Be    css=table thead th:nth-child(1)    Instance ID
    Element Text Should Be    css=table thead th:nth-child(2)    Name
    Element Text Should Be    css=table thead th:nth-child(3)    State
    Element Text Should Be    css=table thead th:nth-child(4)    Public IP
    Element Text Should Be    css=table thead th:nth-child(5)    Private IP
    ${row_count}=    Get Element Count    css=table tbody tr
    Run Keyword If    ${row_count} > 0    Validate First Row    ELSE    Log    "No instances returned by server (row_count=0)"    WARN

Validate First Row
    ${first_id}=    Get Text    css=table tbody tr:nth-child(1) td:nth-child(1)
    Should Match Regexp    ${first_id}    ^(i-[0-9a-fA-F]+|N/A)$
    # optional checks for other cells if available
    ${first_state}=    Get Text    css=table tbody tr:nth-child(1) td:nth-child(3)
    Should Not Be Empty    ${first_state}

