import { createReport } from 'docx-templates';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

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

    const buffer = await createReport({
      template,
      data: {
        projectOwner: data.projectOwner || '',
        suppliers: data.suppliers || [],
        invitationDate: data.invitationDate || '',
        expirationDate: data.expirationDate || '',
        deliveryDate: data.deliveryDate || '',
        currentDate: new Date().toLocaleDateString('tr-TR')
      },
      cmdDelimiter: ['{{', '}}'],
      noSandbox: true // Güvenlik hatası alırsanız
    });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${data.templateType}.docx`,
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