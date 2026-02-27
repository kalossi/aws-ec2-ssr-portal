*** Settings ***
Library           Browser

*** Variables ***
${HEADLESS}       true
# ${BASE}           http://ssr_next_app:3000

*** Test Cases ***
Open Example Page
    New Browser    browser=chromium    headless=${HEADLESS}
    New Context    ignoreHTTPSErrors=True
    New Page       https://example.com
    ${title}=      Get Title
    Should Be Equal    ${title}    Example Domain
    Close Browser

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

Simple S3 Smoke
    New Browser    browser=chromium    headless=${HEADLESS}
    New Context    ignoreHTTPSErrors=True
    New Page    url=${BASE}/s3
    Wait For Elements State    css=body    visible    timeout=20s
     # Get page source and check for file input
    ${src}=    Get Page Source
    Wait For Elements State    css=input[type="file"]    visible    timeout=10s
    ${has_input}=    Run Keyword And Return Status    Should Contain Element    css=#file-upload
    Run Keyword If    ${has_input}    Log    File input present    ELSE    Fail    File input not found on S3 page
    # Check for max file size text
    ${has_max}=    Run Keyword And Return Status    Should Contain    ${src}    Max file size allowed
    Run Keyword If    ${has_max}    Log    Max file size info present    ELSE    Log    Max file size info missing
    Take Screenshot
    Close Browser
