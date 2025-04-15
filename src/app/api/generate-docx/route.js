import { createReport } from 'docx-templates';
import fs from 'fs';
import path from 'path';



export async function POST(request) {
  try {
    const data = await request.json();

    if (!data?.templateType) {
      return new Response(JSON.stringify({ error: 'templateType is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const templateFileName = {
      'TeknikSartname': 'TeknikSartnameTemplate.docx',
      'TeklifDavetMektubu': 'TeklifDavetMektubuTemplate.docx',
      'TeklifSunumFormu': 'TeklifSunumFormuTemplate.docx'
    }[data.templateType];

    if (!templateFileName) {
      return new Response(JSON.stringify({ error: 'Invalid templateType' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const templatePath = path.join(process.cwd(), 'public', 'templates', templateFileName);
    console.log('Looking for template at:', templatePath);

    if (!fs.existsSync(templatePath)) {
      return new Response(JSON.stringify({
        error: 'Template file not found',
        path: templatePath
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const template = fs.readFileSync(templatePath);
    console.log('Template loaded successfully');

    // Tüm belgeler için ortak veriler
    const templateData = {
      projectOwner: data.projectOwner || '',
      invitationDate: data.invitationDate || '',
      expirationDate: data.expirationDate || '',
      deliveryDate: data.deliveryDate || '',
      currentDate: new Date().toLocaleDateString('tr-TR'),
      supplier1: data.supplier1 || {},
      supplier2: data.supplier2 || {},
      supplier3: data.supplier3 || {}
    };

    // Belge türüne göre özel veriler
    if (data.templateType === 'TeklifSunumFormu') {
      templateData.selectedSupplier = data.selectedSupplier || '';
      templateData.selectedPresentationDate = data.selectedPresentationDate || '';
      templateData.supplierNum = data.supplierNum || '';
    } else {
      templateData.suppliers = data.suppliers || [];
      templateData.firstPresentationDate = data.firstPresentationDate || '';
      templateData.secondPresentationDate = data.secondPresentationDate || '';
      templateData.thirdPresentationDate = data.thirdPresentationDate || '';
    }

    const buffer = await createReport({
      template,
      data: templateData,
      cmdDelimiter: ['{{', '}}'],
      noSandbox: true,
      additionalJsContext: {
        toUpper: (str) => str.replaceAll('i', 'İ').toUpperCase(),
        formatDate: (date) => date.replaceAll('.', '/'),
        formatPhone: (p) => {
          p = String(p)
          return `0 (${p[0] + p[1] + [2]}) ${p[3] + p[4] + [5]} ${p[6] + p[7]} ${p[8] + p[9]}`
        }
      }
    });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${data.templateType}${data.supplierNum ? `_${data.supplierNum}` : ''}.docx`,
      },
    });

  } catch (error) {
    console.error('Full error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}