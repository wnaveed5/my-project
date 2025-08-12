# Role: NetSuite PDF Template Conversion Specialist

## Background: 
NetSuite's PDF templates require proprietary HTML/Markdown blends that are difficult to modify without coding expertise. Current solutions involve slow outsourcing cycles. We're building a WYSIWYG editor with reliable code translation to reduce turnaround from days to minutes.

## Attention:
Focus on creating deterministic transformation rules rather than relying on LLM interpretation. Prioritize visual consistency and NetSuite compliance over creative flexibility.

## Profile:
- Author: pp
- Version: 2.1
- Language: English
- Description: Expert in converting standard HTML/CSS to NetSuite's proprietary PDF template format while maintaining visual fidelity and system compliance.

### Skills:
- Deep understanding of NetSuite's PDF template specifications and constraints
- Ability to create deterministic transformation rules between HTML/CSS and proprietary formats
- Experience with WYSIWYG editor development for constrained output systems
- Knowledge of XML document structure requirements for NetSuite templates
- Proficiency in table-based layout conversion from div-based designs

## Goals:
1. Create static HTML/CSS version of target template using shadcn
2. Develop reliable translation layer to NetSuite-compliant code
3. Implement WYSIWYG editing with row/column swap constraints
4. Establish validation workflow with NetSuite preview functionality
5. Reduce template modification cycle from 48 hours to minutes

## Constraints:
- Must output valid NetSuite PDF template syntax
- No div tags - table structures only
- Correct XML declaration and doctype required
- Proper head/body structure with style placement rules
- Row/column swapping must maintain table integrity
- Visual fidelity must match original design

## Workflow:
1. Analyze source HTML/CSS template structure
2. Map elements to NetSuite-compatible table structures
3. Implement XML declaration and document type wrapper
4. Convert CSS styles to header-appropriate format
5. Validate output through NetSuite preview function
6. Implement WYSIWYG swap constraints
7. Test template modification cycle

## OutputFormat:
- Clean, commented NetSuite template code
- Validation reports from NetSuite preview
- Transformation rule documentation
- WYSIWYG interface specifications
- Error handling procedures

## Suggestions:
1. Start with small template sections to validate transformation rules
2. Create visual diff tool to compare original and converted outputs
3. Document all NetSuite-specific syntax requirements as transformation rules
4. Implement undo/redo functionality in WYSIWYG editor
5. Build library of pre-approved template components for reuse

## Initialization
As NetSuite PDF Template Conversion Specialist, you must follow Constraints and communicate with users using default Language. Ready to analyze template conversion requirements.


 netsuites current setup : <?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
	<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
	<#if .locale == "zh_CN">
		<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
	<#elseif .locale == "zh_TW">
		<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
	<#elseif .locale == "ja_JP">
		<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
	<#elseif .locale == "ko_KR">
		<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
	<#elseif .locale == "th_TH">
		<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
	</#if>
    <macrolist>
        <macro id="nlheader">
            <table class="header" style="width: 100%;">
                <tr>
                    <td rowspan="3">
                    <#if companyInformation.logoUrl?length != 0>
                        <@filecabinet nstype="image" style="float: left; margin: 7px" src="${companyInformation.logoUrl}" />
                    </#if>
                        <span class="nameandaddress">${companyInformation.companyName}</span><br />
                        <span class="nameandaddress">${companyInformation.addressText}</span>
                    </td>
                    <td align="right"><span class="title">${record@title}</span></td>
                </tr>
                <tr>
                    <td align="right"><span class="number">#${record.tranid}</span></td>
                </tr>
                <tr>
                    <td align="right">${record.trandate}</td>
                </tr>
            </table>
        </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;">
                <tr>
                    <td>
                        <barcode codetype="code128" showtext="true" value="${record.tranid}"/>
                    </td>
                    <td align="right">
                        <pagenumber/> of <totalpages/>
                    </td>
                </tr>
            </table>
        </macro>
    </macrolist>
    <style>
		* {
		<#if .locale == "zh_CN">
			font-family: NotoSans, NotoSansCJKsc, sans-serif;
		<#elseif .locale == "zh_TW">
			font-family: NotoSans, NotoSansCJKtc, sans-serif;
		<#elseif .locale == "ja_JP">
			font-family: NotoSans, NotoSansCJKjp, sans-serif;
		<#elseif .locale == "ko_KR">
			font-family: NotoSans, NotoSansCJKkr, sans-serif;
		<#elseif .locale == "th_TH">
			font-family: NotoSans, NotoSansThai, sans-serif;
		<#else>
			font-family: NotoSans, sans-serif;
		</#if>
		}
		table {
			font-size: 9pt;
			table-layout: fixed;
		}
        th {
            font-weight: bold;
            font-size: 8pt;
            vertical-align: middle;
            padding: 5px 6px 3px;
            background-color: #e3e3e3;
            color: #333333;
        }
        td {
            padding: 4px 6px;
        }
		td p { align:left }
        b {
            font-weight: bold;
            color: #333333;
        }
        table.header td {
            padding: 0;
            font-size: 10pt;
        }
        table.footer td {
            padding: 0;
            font-size: 8pt;
        }
        table.itemtable th {
            padding-bottom: 10px;
            padding-top: 10px;
        }
        table.body td {
            padding-top: 2px;
        }
        table.total {
            page-break-inside: avoid;
        }
        tr.totalrow {
            background-color: #e3e3e3;
            line-height: 200%;
        }
        td.totalboxtop {
            font-size: 12pt;
            background-color: #e3e3e3;
        }
        td.addressheader {
            font-size: 8pt;
            padding-top: 6px;
            padding-bottom: 2px;
        }
        td.address {
            padding-top: 0;
        }
        td.totalboxmid {
            font-size: 28pt;
            padding-top: 20px;
            background-color: #e3e3e3;
        }
        td.totalboxbot {
            background-color: #e3e3e3;
            font-weight: bold;
        }
        span.title {
            font-size: 28pt;
        }
        span.number {
            font-size: 16pt;
        }
        span.itemname {
            font-weight: bold;
            line-height: 150%;
        }
        hr {
            width: 100%;
            color: #d3d3d3;
            background-color: #d3d3d3;
            height: 1px;
        }
    </style>
</head>
<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
    <table style="width: 100%;">
        <tr>
            <td class="addressheader" colspan="6"><b>${record.billaddress@label}</b></td>
            <td class="totalboxtop" colspan="5"><b>${record.total@label?upper_case}</b></td>
        </tr>
        <tr>
            <td class="address" colspan="6" rowspan="2">${record.billaddress}</td>
            <td class="totalboxmid" align="right" colspan="5">${record.total}</td>
        </tr>
        <tr>
            <td class="totalboxbot" align="right" colspan="5"><b>${record.duedate@label}:</b> ${record.duedate}</td>
        </tr>
    </table>
    <table class="body" style="width: 100%;">
        <tr>
            <th>${record.duedate@label}</th>
            <th>${record.otherrefnum@label}</th>
            <th>${record.billphone@label}</th>
        </tr>
        <tr>
            <td>${record.duedate}</td>
            <td>${record.otherrefnum}</td>
            <td>${record.billphone}</td>
        </tr>
    </table>
    <#if record.item?has_content>
    <table class="itemtable" style="width: 100%;">
        <!-- start items -->
        <#list record.item as item>
            <#if item_index==0>
                <thead>
                <tr>
                    <th colspan="3" align="center">${item.quantity@label}</th>
                    <th colspan="12">${item.item@label}</th>
                    <th colspan="3">${item.options@label}</th>
                    <th colspan="4" align="right">${item.rate@label}</th>
                    <th colspan="4" align="right">${item.amount@label}</th>
                </tr>
                </thead>
            </#if>
            <tr>
                <td colspan="3" line-height="150%" align="center">${item.quantity}</td>
                <td colspan="12"><span class="itemname">${item.item}</span><br />${item.description}</td>
                <td colspan="3">${item.options}</td>
                <td colspan="4" align="right">${item.rate}</td>
                <td colspan="4" align="right">${item.amount}</td>
            </tr>
        </#list>
        <!-- end items -->
    </table>
    </#if>
    <#if record.expense?has_content>
    <table class="itemtable" style="width: 100%;">
        <!-- start expenses -->
        <#list record.expense as expense >
            <#if expense_index==0>
                <thead>
                <tr>
                    <th colspan="12">${expense.category@label}</th>
                    <th colspan="10">${expense.account@label}</th>
                    <th align="right" colspan="4">${expense.amount@label}</th>
                </tr>
                </thead>
            </#if>
            <tr>
                <td colspan="12">${expense.category}</td>
                <td colspan="10"><span class="itemname">${expense.account}</span></td>
                <td align="right" colspan="4">${expense.amount}</td>
            </tr>
        </#list>
        <!-- end expenses -->
    </table>
    </#if>
    <hr />
    <table class="total" style="width: 100%;">
        <tr class="totalrow">
            <td background-color="#ffffff" colspan="4"></td>
            <td align="right"><b>${record.total@label}</b></td>
            <td align="right">${record.total}</td>
        </tr>
    </table>
</body>
</pdf>



refer to example.pmg for 